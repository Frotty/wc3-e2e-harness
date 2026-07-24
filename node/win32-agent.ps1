# Persistent Win32 helper for the e2e runner. The old runner spawned a fresh PowerShell process
# (including an Add-Type C# compile, ~0.5-1.5s) for EVERY screenshot/keypress/chat line — that was
# most of the per-frame detection latency. This agent compiles the interop once, then serves
# commands over stdin/stdout for the whole run.
#
# Protocol (one request per line, one response per line):
#   <id>|ping
#   <id>|fg|<pid>                       -> restore + foreground the process main window
#   <id>|key|<pid>|<keyName>|<alt01>    -> post one key (down/char/up) to the window
#   <id>|text|<pid>|<base64 utf8 text>  -> type a string into the window
#   <id>|shot|<pid>|<base64 utf8 path>  -> PrintWindow capture to PNG at path
# Response: <id>|ok|<data>  or  <id>|err|<message>
#
# Per-key delays come from env (CF_E2E_KEY_EVENT_DELAY_MS etc.), set by the runner at spawn.

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing
Add-Type -TypeDefinition @'
using System;
using System.Runtime.InteropServices;
public static class W32 {
    public delegate bool EnumWindowsProc(IntPtr hWnd, IntPtr lParam);
    [StructLayout(LayoutKind.Sequential)]
    public struct RECT { public int Left; public int Top; public int Right; public int Bottom; }
    [DllImport("user32.dll")] public static extern bool EnumWindows(EnumWindowsProc lpEnumFunc, IntPtr lParam);
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern IntPtr SendMessage(IntPtr hWnd, uint Msg, IntPtr wParam, IntPtr lParam);
    [DllImport("user32.dll")] public static extern bool GetWindowRect(IntPtr hWnd, out RECT lpRect);
    [DllImport("user32.dll")] public static extern bool PrintWindow(IntPtr hWnd, IntPtr hdcBlt, uint nFlags);
    [DllImport("user32.dll")] public static extern bool SetProcessDPIAware();
    [DllImport("user32.dll")] public static extern bool SetProcessDpiAwarenessContext(IntPtr value);
    [DllImport("user32.dll")] public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
    [DllImport("user32.dll")] public static extern bool SetForegroundWindow(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern short VkKeyScan(char ch);
    [DllImport("user32.dll")] public static extern uint MapVirtualKey(uint uCode, uint uMapType);
}
'@

# DPI awareness BEFORE any window/rect call so GetWindowRect returns physical pixels (else a scaled
# display captures only the top-left fraction of the window and OCR silently truncates).
try { [void][W32]::SetProcessDpiAwarenessContext([IntPtr](-4)) } catch { try { [void][W32]::SetProcessDPIAware() } catch {} }

function EnvIntOr([string]$name, [int]$fallback) {
    $v = [Environment]::GetEnvironmentVariable($name)
    $n = 0
    if ($v -and [int]::TryParse($v, [ref]$n)) { return $n }
    return $fallback
}

$KEY_EVENT_DELAY_MS = EnvIntOr 'CF_E2E_KEY_EVENT_DELAY_MS' 20
$TEXT_KEY_DELAY_MS = EnvIntOr 'CF_E2E_TEXT_KEY_DELAY_MS' 2
$TEXT_CHAR_DELAY_MS = EnvIntOr 'CF_E2E_TEXT_CHAR_DELAY_MS' 2
$TEXT_CHAR_GAP_MS = EnvIntOr 'CF_E2E_TEXT_CHAR_GAP_MS' 1

$WM_KEYDOWN = 0x0100
$WM_KEYUP = 0x0101
$WM_CHAR = 0x0102
$WM_SYSKEYDOWN = 0x0104
$WM_SYSKEYUP = 0x0105
$VK_MENU = 0x12
$VK_SHIFT = 0x10
$ALT_SCAN = 0x38

$keyTable = @{
    'space' = @(0x20, 0x39); 'e' = @(0x45, 0x12); 'q' = @(0x51, 0x10)
    'escape' = @(0x1b, 0x01); 'f4' = @(0x73, 0x3e); 'f10' = @(0x79, 0x44); 'enter' = @(0x0d, 0x1c)
}

function FindWindowForPid([long]$targetPid) {
    $script:foundHwnd = [IntPtr]::Zero
    [void][W32]::EnumWindows({
        param([IntPtr]$hwnd, [IntPtr]$lparam)
        $windowPid = [UInt32]0
        [void][W32]::GetWindowThreadProcessId($hwnd, [ref]$windowPid)
        if ($windowPid -eq $targetPid -and [W32]::IsWindowVisible($hwnd)) {
            $script:foundHwnd = $hwnd
            return $false
        }
        return $true
    }, [IntPtr]::Zero)
    return $script:foundHwnd
}

function DoForeground([long]$targetPid) {
    $hwnd = FindWindowForPid $targetPid
    if ($hwnd -eq [IntPtr]::Zero) { return '0' }
    [void][W32]::ShowWindow($hwnd, 9)  # SW_RESTORE: un-minimize and activate
    [void][W32]::SetForegroundWindow($hwnd)
    return '1'
}

function DoKey([long]$targetPid, [string]$keyName, [bool]$alt) {
    $info = $keyTable[$keyName]
    if (-not $info) { throw "unknown key: $keyName" }
    $hwnd = FindWindowForPid $targetPid
    if ($hwnd -eq [IntPtr]::Zero) { throw 'window not found' }
    $vk = [int]$info[0]
    $scan = [int]$info[1]
    $downLParam = 1 -bor ($scan -shl 16)
    $upLParam = 1 -bor ($scan -shl 16) -bor (1 -shl 30) -bor (1 -shl 31)
    $altDownLParam = 1 -bor ($ALT_SCAN -shl 16) -bor (1 -shl 29)
    $altUpLParam = 1 -bor ($ALT_SCAN -shl 16) -bor (1 -shl 29) -bor (1 -shl 30) -bor (1 -shl 31)
    $sysDownLParam = $downLParam -bor (1 -shl 29)
    $sysUpLParam = $upLParam -bor (1 -shl 29)
    if ($alt) {
        [void][W32]::SendMessage($hwnd, $WM_SYSKEYDOWN, [IntPtr]$VK_MENU, [IntPtr]$altDownLParam)
        Start-Sleep -Milliseconds $KEY_EVENT_DELAY_MS
        [void][W32]::SendMessage($hwnd, $WM_SYSKEYDOWN, [IntPtr]$vk, [IntPtr]$sysDownLParam)
        Start-Sleep -Milliseconds $KEY_EVENT_DELAY_MS
        [void][W32]::SendMessage($hwnd, $WM_SYSKEYUP, [IntPtr]$vk, [IntPtr]$sysUpLParam)
        Start-Sleep -Milliseconds $KEY_EVENT_DELAY_MS
        [void][W32]::SendMessage($hwnd, $WM_SYSKEYUP, [IntPtr]$VK_MENU, [IntPtr]$altUpLParam)
    } elseif ($vk -eq 0x79) {
        [void][W32]::SendMessage($hwnd, $WM_SYSKEYDOWN, [IntPtr]$vk, [IntPtr]$sysDownLParam)
        Start-Sleep -Milliseconds $KEY_EVENT_DELAY_MS
        [void][W32]::SendMessage($hwnd, $WM_SYSKEYUP, [IntPtr]$vk, [IntPtr]$sysUpLParam)
    } else {
        [void][W32]::SendMessage($hwnd, $WM_KEYDOWN, [IntPtr]$vk, [IntPtr]$downLParam)
        if ($vk -ge 0x30 -and $vk -le 0x5A) {
            [void][W32]::SendMessage($hwnd, $WM_CHAR, [IntPtr]($vk + 32), [IntPtr]$downLParam)
        }
        Start-Sleep -Milliseconds $KEY_EVENT_DELAY_MS
        [void][W32]::SendMessage($hwnd, $WM_KEYUP, [IntPtr]$vk, [IntPtr]$upLParam)
    }
    return '1'
}

function DoText([long]$targetPid, [string]$text) {
    $hwnd = FindWindowForPid $targetPid
    if ($hwnd -eq [IntPtr]::Zero) { throw 'window not found' }
    $shiftScan = [W32]::MapVirtualKey($VK_SHIFT, 0)
    $shiftDown = 1 -bor ($shiftScan -shl 16)
    $shiftUp = 1 -bor ($shiftScan -shl 16) -bor (1 -shl 30) -bor (1 -shl 31)
    foreach ($ch in $text.ToCharArray()) {
        $code = [int][W32]::VkKeyScan($ch)
        if ($code -eq -1) {
            [void][W32]::SendMessage($hwnd, $WM_CHAR, [IntPtr][int][char]$ch, [IntPtr]1)
            Start-Sleep -Milliseconds $TEXT_CHAR_GAP_MS
            continue
        }
        $vk = $code -band 0xff
        $mods = ($code -shr 8) -band 0xff
        $scan = [W32]::MapVirtualKey($vk, 0)
        $downLParam = 1 -bor ($scan -shl 16)
        $upLParam = 1 -bor ($scan -shl 16) -bor (1 -shl 30) -bor (1 -shl 31)
        if (($mods -band 1) -ne 0) {
            [void][W32]::SendMessage($hwnd, $WM_KEYDOWN, [IntPtr]$VK_SHIFT, [IntPtr]$shiftDown)
            Start-Sleep -Milliseconds $TEXT_KEY_DELAY_MS
        }
        [void][W32]::SendMessage($hwnd, $WM_KEYDOWN, [IntPtr]$vk, [IntPtr]$downLParam)
        Start-Sleep -Milliseconds $TEXT_KEY_DELAY_MS
        [void][W32]::SendMessage($hwnd, $WM_CHAR, [IntPtr][int][char]$ch, [IntPtr]$downLParam)
        Start-Sleep -Milliseconds $TEXT_CHAR_DELAY_MS
        [void][W32]::SendMessage($hwnd, $WM_KEYUP, [IntPtr]$vk, [IntPtr]$upLParam)
        if (($mods -band 1) -ne 0) {
            Start-Sleep -Milliseconds $TEXT_KEY_DELAY_MS
            [void][W32]::SendMessage($hwnd, $WM_KEYUP, [IntPtr]$VK_SHIFT, [IntPtr]$shiftUp)
        }
        Start-Sleep -Milliseconds $TEXT_CHAR_GAP_MS
    }
    return '1'
}

function DoShot([long]$targetPid, [string]$outPath) {
    $hwnd = FindWindowForPid $targetPid
    if ($hwnd -eq [IntPtr]::Zero) { throw 'window not found' }
    $rect = New-Object W32+RECT
    if (-not [W32]::GetWindowRect($hwnd, [ref]$rect)) { throw 'GetWindowRect failed' }
    $width = $rect.Right - $rect.Left
    $height = $rect.Bottom - $rect.Top
    if ($width -le 0 -or $height -le 0) { throw 'window has no size' }
    $bitmap = New-Object System.Drawing.Bitmap $width, $height
    $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
    try {
        $hdc = $graphics.GetHdc()
        $printed = $false
        try { $printed = [W32]::PrintWindow($hwnd, $hdc, 2) } finally { $graphics.ReleaseHdc($hdc) }
        if (-not $printed) { throw 'PrintWindow failed' }
        $bitmap.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
    } finally {
        $graphics.Dispose()
        $bitmap.Dispose()
    }
    return $outPath
}

function DecodeB64([string]$value) {
    return [System.Text.Encoding]::UTF8.GetString([Convert]::FromBase64String($value))
}

$stdout = [Console]::Out
while ($true) {
    $line = [Console]::In.ReadLine()
    if ($null -eq $line) { break }
    $line = $line.Trim()
    if ($line.Length -eq 0) { continue }
    $parts = $line.Split('|')
    $id = $parts[0]
    try {
        $cmd = if ($parts.Length -gt 1) { $parts[1] } else { '' }
        $data = switch ($cmd) {
            'ping' { 'pong' }
            'fg'   { DoForeground ([long]$parts[2]) }
            'key'  { DoKey ([long]$parts[2]) $parts[3] ($parts[4] -eq '1') }
            'text' { DoText ([long]$parts[2]) (DecodeB64 $parts[3]) }
            'shot' { DoShot ([long]$parts[2]) (DecodeB64 $parts[3]) }
            default { throw "unknown command: $cmd" }
        }
        $stdout.WriteLine("$id|ok|$data")
    } catch {
        $msg = ($_ | Out-String).Trim() -replace "[\r\n|]+", ' '
        $stdout.WriteLine("$id|err|$msg")
    }
    $stdout.Flush()
}
