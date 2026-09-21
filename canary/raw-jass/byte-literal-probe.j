// this script was compiled with wurst 1.9.0.0-nightly-1-g1d3a5abd0
globals
string probeLocalResult="NOT_RUN"
boolean probeControlFlag=false
real w=0.
integer array u
integer r=0
integer array s
integer array t
integer array i
integer array S
boolean array c
integer o=0
integer O=0
integer l=0
string array b
integer y=0
integer p=0
real e=0.
integer q=0
integer a=0
integer n=0
integer d=0
integer f=0
integer R=0
boolean T=false
boolean Y=false
boolean G=false
string g=null
string h=null
string F=null
string k=null
string j=null
integer x=0
integer v=0
real m=0.
integer Q=0
integer W=0
integer E=0
integer Z=0
string U=null
integer I=0
boolean P=false
integer A=0
hashtable D=null
boolean H=false
integer array J
integer K=0
string L=null
integer X=0
boolean C=false
string V=null
real B=0.
hashtable N=null
hashtable M=null
boolean ww=false
boolean uw=false
player rw=null
integer sw=0
real tw=0.
boolean iw=false
boolean Sw=false
string cw=null
integer ow=0
integer Ow=0
boolean lw=false
string bw=null
hashtable yw=null
integer pw=0
string ew=null
integer qw=0
string aw=null
hashtable nw=null
integer dw=0
hashtable fw=null
timer array Rw
integer Tw=0
integer Yw=0
integer Gw=0
integer gw=0
hashtable hw=null
hashtable Fw=null
hashtable kw=null
hashtable jw=null
integer array xw
integer vw=0
integer mw=0
integer array Qw
integer array Ww
integer Ew=0
integer Zw=0
integer array Uw
integer array Iw
integer Pw=0
integer Aw=0
integer array Dw
integer array Hw
integer Jw=0
integer array Kw
integer array Lw
integer Xw=0
integer Cw=0
integer array Vw
integer array Bw
integer Nw=0
integer Mw=0
integer array wu
integer uu=0
integer ru=0
integer array su
integer tu=0
integer iu=0
integer array Su
integer cu=0
integer ou=0
integer array Ou
integer lu=0
integer array bu
integer array yu
integer pu=0
integer eu=0
integer array qu
integer au=0
integer nu=0
integer array du
integer fu=0
integer Ru=0
integer array Tu
integer Yu=0
integer Gu=0
integer array gu
integer array hu
integer Fu=0
integer ku=0
integer array ju
integer array xu
integer vu=0
integer mu=0
integer array Qu
integer array Wu
integer array Eu
integer array Zu
string array Uu
integer array Iu
timerdialog array Pu
timer array Au
timer array Du
string array Hu
integer array Ju
string array Ku
real array Lu
string array Xu
integer array Cu
string array Vu
integer array Bu
boolean array Nu
integer array Mu
integer array wr
integer array ur
integer array rr
integer array sr
integer array tr
integer array ir
boolean array Sr
integer array cr
integer array lr
string array br
integer array yr
integer array pr
integer er=0
string array qr
code fr=null
code Yr=null
code Gr=null
code hr=null
code Fr=null
code kr=null
code jr=null
code xr=null
code vr=null
code Wr=null
code Ur=null
code Pr=null
code Hr=null
code Jr=null
code Kr=null
code Lr=null
code Xr=null
code Nr=null
code Mr=null
code us=null
code ss=null
code ts=null
code is=null
code Ss=null
code cs=null
code os=null
code Os=null
code ls=null
endglobals
function probeWriteFile takes string probeF,string probeL returns nothing
call PreloadGenClear()
call PreloadGenStart()
call Preload(probeL)
call PreloadGenEnd(probeF)
endfunction
function probeControlThread takes nothing returns nothing
call probeWriteFile("probe-b-control.txt","ascii-ok")
endfunction
function probeValidUtf8Thread takes nothing returns nothing
local string probeS="–ü—Ä–∏–≤–µ—Ç"
call probeWriteFile("probe-b-utf8.txt",probeS+"|len="+I2S(StringLength(probeS)))
endfunction
function probeLoneHighThread takes nothing returns nothing
local string probeS="ÄÅ˛ˇ"
call probeWriteFile("probe-b-lone.txt",probeS+"|len="+I2S(StringLength(probeS)))
endfunction
function probeScrambledThread takes nothing returns nothing
local string probeS="—†“Å—π—≥—∂“É"
call probeWriteFile("probe-b-scram.txt",probeS+"|len="+I2S(StringLength(probeS)))
endfunction
function probeMixedThread takes nothing returns nothing
local string probeS="A√B©C"
call probeWriteFile("probe-b-mixed.txt",probeS+"|len="+I2S(StringLength(probeS)))
endfunction
function probeRoundTripThread takes nothing returns nothing
local string probeA="ÄÅ˛ˇ"
local string probeB="ÄÅ˛ˇ"
if probeA==probeB then
call probeWriteFile("probe-b-eq.txt","EQUAL|len="+I2S(StringLength(probeA))+"|sub="+SubString(probeA,1,3))
else
call probeWriteFile("probe-b-eq.txt","NOTEQUAL")
endif
endfunction
function Mo takes nothing returns nothing
set jw=InitHashtable()
set kw=InitHashtable()
set Fw=InitHashtable()
set hw=InitHashtable()
call SaveInteger(hw,1,-242600650,0)
call SaveInteger(hw,1,1132341824,1)
call SaveInteger(hw,1,-647782241,2)
call SaveInteger(hw,1,-854572045,3)
call SaveInteger(hw,1,-680649701,4)
call SaveInteger(hw,1,-943650483,5)
call SaveInteger(hw,1,-671760605,6)
call SaveInteger(hw,1,349230650,7)
call SaveInteger(hw,1,-1894922563,8)
call SaveInteger(hw,1,-1474492777,9)
call SaveInteger(hw,1,-1587459251,10)
call SaveInteger(hw,1,-1676716706,11)
call SaveInteger(hw,1,-1559655710,12)
call SaveInteger(hw,1,-1663695754,13)
call SaveInteger(hw,1,597637742,14)
call SaveInteger(hw,1,789744696,15)
call SaveStr(hw,2,0,"")
endfunction
function ys takes string bs returns nothing
endfunction
function Ni takes string Di,string Hi returns nothing
local integer Ji
local string Ki
local hashtable Li
local player Xi
local integer Ci
local real Vi
local integer Bi
set qr[er]=Hi
set er=er+1
if ww then
call ys("ERROR: "+Di)
elseif uw then
else
if not H then
set Ki=Di
set Ji=StringHash(Ki)
set Li=D
set Bi=Ji
if HaveSavedInteger(Li,-1,Bi) then
set Li=D
set Bi=Ji
if LoadInteger(Li,-1,Bi)+A<B then
set Ki=Di
set Di=" Stacktrace:"
set Ci=er
set Bi=0
loop
set Ci=Ci-1
set Bi=Bi+1
exitwhen Bi>20 or Ci<0
set Di=Di+"\n   "+qr[Ci]
endloop
if Di==" Stacktrace:" then
set Di=" Stacktrace: <none>"
endif
set Di=Ki+Di
set Xi=rw
if sw<=4 then
set Ci=4
set Ki="|cffFB2700error|r"
set Di=Ki+" - "+Di
call DisplayTimedTextToPlayer(Xi,0.,0.,tw,Di)
endif
set Li=D
set Bi=Ji
set Vi=B
set Ci=R2I(Vi)
call SaveInteger(Li,-1,Bi,Ci)
set Li=D
call SaveBoolean(Li,-1,Ji,false)
else
set Li=D
set Ci=Ji
if HaveSavedBoolean(Li,-1,Ci) then
set Li=D
set Ci=Ji
if not LoadBoolean(Li,-1,Ci) then
set Xi=rw
if sw<=4 then
set Ci=4
set Di="|cffFB2700error|r"
set Di=Di+" - "+"|cffFF3A29Excessive repeating errors are being omitted"
call DisplayTimedTextToPlayer(Xi,0.,0.,tw,Di)
endif
set Li=D
call SaveBoolean(Li,-1,Ji,true)
endif
else
set Xi=rw
if sw<=4 then
set Bi=4
set Di="|cffFB2700error|r"
set Di=Di+" - "+"|cffFF3A29Excessive repeating errors are being omitted"
call DisplayTimedTextToPlayer(Xi,0.,0.,tw,Di)
endif
set Li=D
call SaveBoolean(Li,-1,Ji,true)
endif
endif
else
set Li=D
set Vi=B
set Ci=R2I(Vi)
call SaveInteger(Li,-1,Ji,Ci)
set Ki="Message: "+Di
set Di=" Stacktrace:"
set Ji=er
set Ci=0
loop
set Ji=Ji-1
set Ci=Ci+1
exitwhen Ci>20 or Ji<0
set Di=Di+"\n   "+qr[Ji]
endloop
if Di==" Stacktrace:" then
set Di=" Stacktrace: <none>"
endif
set Di=Ki+Di
set Xi=rw
if sw<=4 then
set Bi=4
set Ki="|cffFB2700error|r"
set Di=Ki+" - "+Di
call DisplayTimedTextToPlayer(Xi,0.,0.,tw,Di)
endif
endif
endif
call I2S(1/0)
endif
set er=er-1
set Li=null
set Xi=null
endfunction
function fo takes string no returns integer
local integer do
set qr[er]=no
set er=er+1
set qr[er]="when calling alloc_Table in Table, line 6"
set er=er+1
if pu==0 then
if eu<JASS_MAX_ARRAY_SIZE then
set eu=eu+1
set do=eu
set qu[do]=977
else
call Ni("Out of memory: Could not create Table.","when calling error in Table, line 7")
set do=0
endif
else
set pu=pu-1
set do=yu[pu]
set qu[do]=977
endif
set er=er-1-1
return do
endfunction
function Do takes nothing returns boolean
local integer Po
local hashtable Ao
set qr[er]="via function reference TypeCasting, line 1"
set er=er+1
set gw=fo("when calling new_Table in TypeCasting, line 7")
call InitHashtable()
set qr[er]="when calling initTypecastData in TypeCasting, line 21"
set er=er+1
set Po=gw
set qr[er]="when calling saveString in TypeCasting, line 12"
set er=er+1
if qu[Po]==0 then
if Po==0 then
call Ni("Nullpointer exception when calling Table.saveString","when calling error in Table, line 61")
else
call Ni("Called Table.saveString on invalid object.","when calling error in Table, line 61")
endif
endif
set Ao=fw
set Po=Po
call SaveStr(Ao,Po,0,"")
set er=er-1-1-1
set Ao=null
return true
endfunction
function Hc takes nothing returns boolean
set r=200
return true
endfunction
function Pt takes nothing returns boolean
call CreateGroup()
set o=0
call Filter(cs)
set O=0
set l=1
return true
endfunction
function nt takes string qt returns integer
local integer at
set qr[er]=qt
set er=er+1
set qr[er]="when calling alloc_HashMap in HashMap, line 7"
set er=er+1
if pu==0 then
if eu<JASS_MAX_ARRAY_SIZE then
set eu=eu+1
set at=eu
set qu[at]=978
else
call Ni("Out of memory: Could not create HashMap.","when calling error in HashMap, line 8")
set at=0
endif
else
set pu=pu-1
set at=yu[pu]
set qu[at]=978
endif
set er=er-1-1
return at
endfunction
function RO takes nothing returns boolean
set qr[er]="via function reference TimerUtils, line 1"
set er=er+1
set Tw=0
set Yw=fo("when calling new_Table in TimerUtils, line 13")
set Gw=679645218
call nt("when calling new_HashMap in TimerUtils, line 59")
set er=er-1
return true
endfunction
function SS takes nothing returns boolean
call Location(0.,0.)
return true
endfunction
function Sl takes nothing returns boolean
call CreateGroup()
return true
endfunction
function Uo takes nothing returns boolean
set sw=2
set tw=45.
return true
endfunction
function Vc takes nothing returns boolean
local integer Kc
local integer Lc
local integer Xc
local integer Cc
set u[0]=1
set Xc=1
set Kc=1
set Lc=31
loop
exitwhen Kc>Lc
set u[Kc]=u[Kc-1]*2
set Cc=u[Kc]
set Xc=BlzBitOr(Xc,Cc)
set Kc=Kc+1
endloop
set Kc=0
set Lc=31
loop
exitwhen Kc>Lc
set Kc=Kc+1
endloop
return true
endfunction
function Wo takes nothing returns boolean
local integer To
local integer Yo
local string Go
local integer go
local string ho
local string Fo
local integer ko
local integer jo
local integer xo
local boolean vo
local integer mo
local hashtable Qo
set Sw=true
set cw=SubString("‰",0,1)
set Go=cw
set ow=StringHash(Go)
set Ow=1843378377
set lw=cw!="‰" and cw!=""
set bw="????????????????????????????????????????????????????????????????"
set yw=InitHashtable()
set Go=SubString("?",0,1)
set pw=StringHash(Go)
set ew="0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ"
set Go=ew
set qw=StringLength(Go)
set aw=" !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~"
set nw=InitHashtable()
set dw=qw
set To=0
set Go=aw
set Yo=StringLength(Go)-1
loop
exitwhen To>Yo
set Go=aw
set go=To+1
set Go=SubString(Go,To,go)
if Go==StringCase(Go,true) then
set ho=ew
set Fo=Go
set vo=false
set ko=StringLength(Go)
set jo=0
set xo=StringLength(ho)-ko
loop
exitwhen vo or((not vo)and jo>xo)
if not vo then
set go=jo+ko
if SubString(ho,jo,go)==Fo then
if not vo then
set mo=jo
set vo=true
endif
endif
endif
if not vo then
set jo=jo+1
endif
endloop
if not vo then
set mo=-1
set vo=true
endif
if not vo then
set mo=0
endif
if mo>=0 then
set go=mo
else
set go=dw+To+32
endif
set Qo=nw
call SaveInteger(Qo,0,StringHash(Go),go+1)
endif
set To=To+1
endloop
set ko=0
loop
exitwhen ko>63
set Qo=yw
set Go=bw
set jo=ko*2+1
set xo=ko*2+2
set Go=SubString(Go,jo,xo)
call SaveBoolean(Qo,0,StringHash(Go),true)
set ko=ko+1
endloop
set Qo=null
return true
endfunction
function XO takes nothing returns boolean
local timer JO=CreateTimer()
local real KO
local code LO
call TimerStart(JO,100000.,false,null)
set JO=CreateTimer()
set KO=w
set LO=Os
call TimerStart(JO,KO,true,LO)
set JO=null
return true
endfunction
function Zo takes nothing returns boolean
set qr[er]="via function reference EventHelper, line 1"
set er=er+1
call nt("when calling new_HashMap in EventHelper, line 6")
call nt("when calling new_HashMap in EventHelper, line 7")
call fo("when calling new_Table in EventHelper, line 8")
set er=er-1
return true
endfunction
function as takes nothing returns boolean
set A=60
set D=Fw
set H=false
return true
endfunction
function cl takes nothing returns boolean
set w=0.030
return true
endfunction
function wS takes handle Mi returns integer
return GetHandleId(Mi)
endfunction
function No takes integer Ko,integer Lo,integer Xo,string Co returns integer
local integer Vo
local integer Bo
set qr[er]=Co
set er=er+1
set qr[er]="when calling alloc_LLEntry in LinkedList, line 456"
set er=er+1
if fu==0 then
if Ru<JASS_MAX_ARRAY_SIZE then
set Ru=Ru+1
set Vo=Ru
else
call Ni("Out of memory: Could not create LLEntry.","when calling error in LinkedList, line 451")
set Vo=0
endif
else
set fu=fu-1
set Vo=du[fu]
endif
set er=er-1
set Bo=Vo
set wr[Bo]=Ko
set ur[Bo]=Lo
set rr[Bo]=Xo
set er=er-1
return Vo
endfunction
function xi takes integer hi,string Fi,integer ki returns nothing
local integer ji
set qr[er]=Fi
set er=er+1
if ju[hi]==0 then
if hi==0 then
call Ni("Nullpointer exception when calling LinkedList.add","when calling error in LinkedList, line 37")
else
call Ni("Called LinkedList.add on invalid object.","when calling error in LinkedList, line 37")
endif
endif
set qr[er]="when calling add in LinkedList, line 37"
set er=er+1
set ji=No(ki,ur[cr[hi]],cr[hi],"when calling new_LLEntry in LinkedList, line 39")
set rr[ur[cr[hi]]]=ji
set ur[cr[hi]]=ji
set lr[hi]=lr[hi]+1
set er=er-1-1
endfunction
function co takes nothing returns nothing
local unit so
local integer io
local integer So
set qr[er]="via function reference ClosureForGroups, line 21"
set er=er+1
set so=GetFilterUnit()
set qr[er]="when calling filterCallback in ClosureForGroups, line 21"
set er=er+1
set io=o-1
set So=t[io]
if So==O then
set io=s[o-1]
set qr[er]="when calling callback in ClosureForGroups, line 30"
set er=er+1
if Hw[io]==0 then
if io==0 then
call Ni("Nullpointer exception when calling ForGroupCallback.callback","when calling error in ClosureForGroups, line 4")
else
call Ni("Called ForGroupCallback.callback on invalid object.","when calling error in ClosureForGroups, line 4")
endif
endif
set qr[er]="when calling callback_forEachFrom_LinkedList in ClosureForGroups, line 4"
set er=er+1
set io=Mu[io]
call xi(io,"when calling add in LinkedList, line 611",wS(so))
set er=er-1-1
elseif So==l then
if S[io]<i[io]then
set So=s[o-1]
set qr[er]="when calling callback in ClosureForGroups, line 33"
set er=er+1
if Hw[So]==0 then
if So==0 then
call Ni("Nullpointer exception when calling ForGroupCallback.callback","when calling error in ClosureForGroups, line 4")
else
call Ni("Called ForGroupCallback.callback on invalid object.","when calling error in ClosureForGroups, line 4")
endif
endif
set qr[er]="when calling callback_forEachFrom_LinkedList in ClosureForGroups, line 4"
set er=er+1
set So=Mu[So]
call xi(So,"when calling add in LinkedList, line 611",wS(so))
set er=er-1-1
endif
set S[io]=S[io]+1
elseif not c[io]then
set c[io]=true
endif
set er=er-1-1
set so=null
endfunction
function KS takes timer IS,integer PS,string AS returns nothing
local integer DS
local integer HS
local hashtable JS
set qr[er]=AS
set er=er+1
set HS=Yw
set DS=wS(IS)
set qr[er]="when calling saveInt in TimerUtils, line 18"
set er=er+1
if qu[HS]==0 then
if HS==0 then
call Ni("Nullpointer exception when calling Table.saveInt","when calling error in Table, line 43")
else
call Ni("Called Table.saveInt on invalid object.","when calling error in Table, line 43")
endif
endif
set JS=fw
set HS=HS
call SaveInteger(JS,HS,DS,PS)
set er=er-1-1
set JS=null
endfunction
function HO takes string jO,string xO returns string
local integer vO
local integer mO
local integer QO
local integer WO
local integer EO
local integer ZO
local integer UO
local string IO
local string PO
local boolean AO
local integer DO
set qr[er]=xO
set er=er+1
set vO=33052
set mO=40389
set QO=0
set IO=jO
set WO=StringLength(IO)-1
loop
exitwhen QO>WO
set IO=jO
set ZO=QO
set IO=SubString(IO,ZO,ZO+1)
set AO=false
set qr[er]="when calling charCode in E2EProtocol, line 45"
set er=er+1
set EO=0
set UO=StringLength(" !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~")-1
loop
exitwhen AO or((not AO)and EO>UO)
if not AO then
set ZO=EO
if SubString(" !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~",ZO,ZO+1)==IO then
if not AO then
set er=er-1
endif
if not AO then
set DO=32+EO
set AO=true
endif
endif
endif
if not AO then
set EO=EO+1
endif
endloop
if not AO then
call Ni("E2EProtocol: non-ascii character in protocol content","when calling error in E2EProtocol, line 20")
endif
if not AO then
set er=er-1
endif
if not AO then
set DO=-1
set AO=true
endif
if not AO then
set DO=0
endif
set EO=DO
set ZO=0
set UO=1
loop
exitwhen mO<=0 and EO<=0
if ModuloInteger(mO,2)!=ModuloInteger(EO,2) then
set ZO=ZO+UO
endif
set mO=mO/2
set EO=EO/2
set UO=UO*2
endloop
set mO=ZO
set ZO=mO*403
set vO=mO*256+vO*403+ZO/65536
set mO=ModuloInteger(ZO,65536)
set vO=ModuloInteger(vO,65536)
set QO=QO+1
endloop
set QO=vO
set jO=""
set WO=1
loop
exitwhen WO>4
set EO=ModuloInteger(QO,16)
set jO=SubString("0123456789abcdef",EO,EO+1)+jO
set QO=QO/16
set WO=WO+1
endloop
set PO=jO
set QO=mO
set jO=""
set WO=1
loop
exitwhen WO>4
set EO=ModuloInteger(QO,16)
set jO=SubString("0123456789abcdef",EO,EO+1)+jO
set QO=QO/16
set WO=WO+1
endloop
set jO=PO+jO
set er=er-1
return jO
endfunction
function aS takes integer eS,string qS returns nothing
set qr[er]=qS
set er=er+1
if Ou[eS]==0 then
if eS==0 then
call Ni("Nullpointer exception when calling File.File","when calling error in FileIO, line 42")
else
call Ni("Called File.File on invalid object.","when calling error in FileIO, line 42")
endif
endif
set qr[er]="when calling destroyFile in FileIO, line 42"
set er=er+1
set qr[er]="when calling dealloc_File in FileIO, line 42"
set er=er+1
if Ou[eS]==0 then
call Ni("Double free: object of type File","when calling error in FileIO, line 42")
else
set Su[cu]=eS
set cu=cu+1
set Ou[eS]=0
endif
set er=er-1-1-1
endfunction
function Ec takes integer Qc,string Wc returns integer
set qr[er]=Wc
set er=er+1
if Dw[Qc]==0 then
if Qc==0 then
call Ni("Nullpointer exception when calling ChunkedString.getChunkCount","when calling error in ChunkedString, line 85")
else
call Ni("Called ChunkedString.getChunkCount on invalid object.","when calling error in ChunkedString, line 85")
endif
endif
set Qc=Zu[Qc]+1
set er=er-1
return Qc
endfunction
function aO takes integer wO,string uO,string rO returns nothing
local integer sO
local integer tO
local integer iO
local string SO
local string cO
local integer oO
local integer OO
local boolean lO
local boolean bO
local boolean yO
local boolean pO
local hashtable eO
local string qO
set qr[er]=rO
set er=er+1
if Dw[wO]==0 then
if wO==0 then
call Ni("Nullpointer exception when calling ChunkedString.append","when calling error in ChunkedString, line 44")
else
call Ni("Called ChunkedString.append on invalid object.","when calling error in ChunkedString, line 44")
endif
endif
set qr[er]="when calling append in ChunkedString, line 44"
set er=er+1
loop
set sO=Eu[wO]
set qO=Uu[wO]
set sO=sO-StringLength(qO)
if Sw and sO>0 then
set tO=0
loop
if tO<3 then
set iO=sO
set qO=uO
set yO=iO<StringLength(qO)
else
set yO=false
endif
if yO then
set qO=uO
set iO=sO
set yO=false
if iO<=0 then
set lO=true
else
set oO=iO
set cO=qO
set lO=oO>=StringLength(cO)
endif
if lO then
set pO=true
set yO=true
endif
if not yO then
set SO=qO
set oO=iO
set iO=iO+1
set SO=SubString(SO,oO,iO)
endif
if not yO then
set qO=SO
set lO=false
if not lw then
set bO=false
set lO=true
endif
if not lO then
set OO=StringHash(qO)
endif
if not lO then
set bO=OO==ow or OO==Ow
set lO=true
endif
if not lO then
set bO=false
endif
if bO then
if not yO then
set pO=true
set yO=true
endif
endif
endif
if not yO then
set eO=yw
set qO=SO
set pO=not LoadBoolean(eO,0,StringHash(qO))
set yO=true
endif
if not yO then
set pO=false
endif
set yO=not pO
else
set yO=false
endif
exitwhen not yO
set sO=sO+1
set tO=tO+1
endloop
endif
set cO=Uu[wO]
set qO=uO
set iO=sO
set Uu[wO]=cO+SubString(qO,0,iO)
set qO=Uu[wO]
if StringLength(qO)>=Eu[wO]then
set iO=Wu[wO]
set tO=Zu[wO]
set qO=Uu[wO]
set qr[er]="when calling saveString in ChunkedString, line 60"
set er=er+1
if qu[iO]==0 then
if iO==0 then
call Ni("Nullpointer exception when calling Table.saveString","when calling error in Table, line 61")
else
call Ni("Called Table.saveString on invalid object.","when calling error in Table, line 61")
endif
endif
set eO=fw
set iO=iO
call SaveStr(eO,iO,tO,qO)
set er=er-1
set Uu[wO]=""
set Zu[wO]=Zu[wO]+1
endif
set qO=uO
set tO=sO
set sO=StringLength(uO)
if tO<2147483647 then
else
set tO=2147483647
endif
set iO=tO
if sO<iO then
set tO=sO
else
set tO=iO
endif
set iO=tO
set sO=iO
set uO=qO
set uO=SubString(uO,sO,StringLength(qO))
set qO=uO
exitwhen StringLength(qO)==0
endloop
set er=er-1-1
set eO=null
endfunction
function FO takes integer TO,string YO returns nothing
local hashtable GO
local integer gO
local integer hO
set qr[er]=YO
set er=er+1
set qr[er]="when calling flush in Table, line 255"
set er=er+1
if qu[TO]==0 then
if TO==0 then
call Ni("Nullpointer exception when calling Table.flush","when calling error in Table, line 251")
else
call Ni("Called Table.flush on invalid object.","when calling error in Table, line 251")
endif
endif
if qu[TO]<=978 then
if qu[TO]<=977 then
set GO=fw
set TO=TO
call FlushChildHashtable(GO,TO)
else
set GO=fw
set TO=TO
call FlushChildHashtable(GO,TO)
endif
else
set qr[er]="when calling flush in Table, line 251"
set er=er+1
if not Nu[TO]then
set gO=Bu[TO]
set qr[er]="when calling clear in HashMap, line 73"
set er=er+1
if bu[gO]==0 then
if gO==0 then
call Ni("Nullpointer exception when calling HashList.clear","when calling error in HashList, line 65")
else
call Ni("Called HashList.clear on invalid object.","when calling error in HashList, line 65")
endif
endif
set GO=N
set hO=gO
call FlushChildHashtable(GO,hO)
set GO=M
set gO=gO
call FlushChildHashtable(GO,gO)
set er=er-1
endif
set GO=fw
set TO=TO
call FlushChildHashtable(GO,TO)
set er=er-1
endif
set er=er-1-1
set GO=null
endfunction
function ao takes integer oo,string Oo returns nothing
local integer lo
local integer bo
local integer yo
local integer po
local hashtable eo
local integer qo
set qr[er]=Oo
set er=er+1
if Dw[oo]==0 then
if oo==0 then
call Ni("Nullpointer exception when calling ChunkedString.ChunkedString","when calling error in ChunkedString, line 32")
else
call Ni("Called ChunkedString.ChunkedString on invalid object.","when calling error in ChunkedString, line 32")
endif
endif
set qr[er]="when calling destroyChunkedString in ChunkedString, line 32"
set er=er+1
set lo=oo
set qr[er]="when calling ChunkedString_onDestroy in ChunkedString, line 156"
set er=er+1
set lo=Wu[lo]
set qr[er]="when calling dispatch_Table_destroyTable in ChunkedString, line 157"
set er=er+1
if qu[lo]==0 then
if lo==0 then
call Ni("Nullpointer exception when calling Table.Table","when calling error in Table, line 7")
else
call Ni("Called Table.Table on invalid object.","when calling error in Table, line 7")
endif
endif
if qu[lo]<=978 then
set qr[er]="when calling destroyTable in Table, line 7"
set er=er+1
call FO(lo,"when calling Table_onDestroy in Table, line 254")
set qr[er]="when calling dealloc_Table in Table, line 254"
set er=er+1
if qu[lo]==0 then
call Ni("Double free: object of type Table","when calling error in Table, line 7")
else
set yu[pu]=lo
set pu=pu+1
set qu[lo]=0
endif
set er=er-1-1
else
set qr[er]="when calling destroyIterableMap in Table, line 7"
set er=er+1
set bo=lo
set qr[er]="when calling IterableMap_onDestroy in HashMap, line 140"
set er=er+1
set yo=Bu[bo]
set qr[er]="when calling dispatch_HashList_destroyHashList in HashMap, line 141"
set er=er+1
if bu[yo]==0 then
if yo==0 then
call Ni("Nullpointer exception when calling HashList.HashList","when calling error in HashList, line 11")
else
call Ni("Called HashList.HashList on invalid object.","when calling error in HashList, line 11")
endif
endif
set qr[er]="when calling destroyHashList in HashList, line 11"
set er=er+1
set po=yo
set qr[er]="when calling HashList_onDestroy in HashList, line 162"
set er=er+1
set qr[er]="when calling clear in HashList, line 163"
set er=er+1
if bu[po]==0 then
if po==0 then
call Ni("Nullpointer exception when calling HashList.clear","when calling error in HashList, line 65")
else
call Ni("Called HashList.clear on invalid object.","when calling error in HashList, line 65")
endif
endif
set eo=N
set qo=po
call FlushChildHashtable(eo,qo)
set eo=M
set po=po
call FlushChildHashtable(eo,po)
set er=er-1-1
set qr[er]="when calling dealloc_HashList in HashList, line 162"
set er=er+1
if bu[yo]==0 then
call Ni("Double free: object of type HashList","when calling error in HashList, line 11")
else
set lu=lu+1
set bu[yo]=0
endif
set er=er-1-1-1
set Nu[bo]=true
set qr[er]="when calling HashMap_onDestroy in HashMap, line 46"
set er=er+1
call FO(bo,"when calling Table_onDestroy in HashMap, line 8")
set er=er-1-1
set qr[er]="when calling dealloc_IterableMap in HashMap, line 140"
set er=er+1
if qu[lo]==0 then
call Ni("Double free: object of type IterableMap","when calling error in HashMap, line 46")
else
set yu[pu]=lo
set pu=pu+1
set qu[lo]=0
endif
set er=er-1-1
endif
set er=er-1-1
set qr[er]="when calling dealloc_ChunkedString in ChunkedString, line 156"
set er=er+1
if Dw[oo]==0 then
call Ni("Double free: object of type ChunkedString","when calling error in ChunkedString, line 32")
else
set Iw[Pw]=oo
set Pw=Pw+1
set Dw[oo]=0
endif
set er=er-1-1-1
set eo=null
endfunction
function ht takes integer dt,integer ft,string Rt returns string
local string Tt
local hashtable Yt
local boolean Gt
local string gt
set qr[er]=Rt
set er=er+1
if Dw[dt]==0 then
if dt==0 then
call Ni("Nullpointer exception when calling ChunkedString.getChunk","when calling error in ChunkedString, line 79")
else
call Ni("Called ChunkedString.getChunk on invalid object.","when calling error in ChunkedString, line 79")
endif
endif
set Gt=false
set qr[er]="when calling getChunk in ChunkedString, line 79"
set er=er+1
if ft==Zu[dt]then
set er=er-1
set gt=Uu[dt]
set Gt=true
endif
if not Gt then
set dt=Wu[dt]
set qr[er]="when calling loadString in ChunkedString, line 82"
set er=er+1
if qu[dt]==0 then
if dt==0 then
call Ni("Nullpointer exception when calling Table.loadString","when calling error in Table, line 58")
else
call Ni("Called Table.loadString on invalid object.","when calling error in Table, line 58")
endif
endif
set Yt=fw
set dt=dt
set Tt=LoadStr(Yt,dt,ft)
set er=er-1
endif
if not Gt then
set er=er-1
endif
if not Gt then
set gt=Tt
set Gt=true
endif
if not Gt then
set gt=null
endif
set er=er-1
set Yt=null
return gt
endfunction
function dc takes integer LS,player XS,string CS,string VS returns nothing
local integer BS
local integer NS
local integer MS
local integer wc
local integer uc
local string rc
local string sc
local integer tc
local integer ic
local integer Sc
local integer cc
local integer oc
local boolean Oc
local boolean lc
local boolean bc
local string yc
local string pc
local integer ec
local boolean qc
local string ac
local string nc
set qr[er]=VS
set er=er+1
if Ou[LS]==0 then
if LS==0 then
call Ni("Nullpointer exception when calling File.write","when calling error in FileIO, line 48")
else
call Ni("Called File.write on invalid object.","when calling error in FileIO, line 48")
endif
endif
set BS=LS
set qr[er]="when calling write in FileIO, line 48"
set er=er+1
set qr[er]="when calling new_ChunkedString in FileIO, line 49"
set er=er+1
set qr[er]="when calling alloc_ChunkedString in ChunkedString, line 39"
set er=er+1
if Pw==0 then
if Aw<JASS_MAX_ARRAY_SIZE then
set Aw=Aw+1
set LS=Aw
set Dw[LS]=885
else
call Ni("Out of memory: Could not create ChunkedString.","when calling error in ChunkedString, line 32")
set LS=0
endif
else
set Pw=Pw-1
set LS=Iw[Pw]
set Dw[LS]=885
endif
set er=er-1
set NS=LS
set qr[er]="when calling construct_ChunkedString in ChunkedString, line 39"
set er=er+1
set qr[er]="when calling ChunkedString_init in ChunkedString, line 39"
set er=er+1
set Wu[NS]=fo("when calling new_Table in ChunkedString, line 33")
set Eu[NS]=r
set Zu[NS]=0
set Uu[NS]=""
set er=er-1-1-1
call aO(LS,CS,"when calling append in FileIO, line 50")
set NS=LS
set qr[er]="when calling write in FileIO, line 51"
set er=er+1
if Ou[BS]==0 then
if BS==0 then
call Ni("Nullpointer exception when calling File.write","when calling error in FileIO, line 54")
else
call Ni("Called File.write on invalid object.","when calling error in FileIO, line 54")
endif
endif
set qr[er]="when calling write in FileIO, line 54"
set er=er+1
if iw then
set MS=0
set wc=Ec(NS,"when calling getChunkCount in FileIO, line 56")-1
loop
exitwhen MS>wc
set CS=ht(NS,MS,"when calling getChunk in FileIO, line 57")
set nc=CS
set bc=false
set qr[er]="when calling validateInput in FileIO, line 58"
set er=er+1
set sc=nc
set qr[er]="when calling iterator in FileIO, line 116"
set er=er+1
set nc=sc
set uc=StringLength(sc)
set qr[er]="when calling new_StringIterator in String, line 375"
set er=er+1
set qr[er]="when calling alloc_StringIterator in String, line 382"
set er=er+1
if vu==0 then
if mu<JASS_MAX_ARRAY_SIZE then
set mu=mu+1
set ic=mu
set Qu[ic]=969
else
call Ni("Out of memory: Could not create StringIterator.","when calling error in String, line 377")
set ic=0
endif
else
set vu=vu-1
set ic=xu[vu]
set Qu[ic]=969
endif
set er=er-1
set Sc=ic
set br[Sc]=nc
set yr[Sc]=0
set pr[Sc]=uc
set er=er-1
set uc=ic
set er=er-1
loop
exitwhen bc
if not bc then
set ic=uc
exitwhen yr[ic]>=pr[ic]
endif
if not bc then
set ic=uc
set rc=br[ic]
set Sc=yr[ic]
set tc=yr[ic]+1
set rc=SubString(rc,Sc,tc)
set Sc=1
if Sw and lw then
set nc=rc
set tc=StringHash(nc)
if pw!=ow and tc==pw then
set Sc=4
set rc=br[ic]
set tc=yr[ic]
set cc=yr[ic]+4
set rc=SubString(rc,tc,cc)
elseif tc==ow or tc==Ow then
set Sc=2
set rc=br[ic]
set tc=yr[ic]
set cc=yr[ic]+2
set rc=SubString(rc,tc,cc)
loop
if Sc<4 and yr[ic]+Sc<pr[ic]then
set nc=rc
set Oc=false
if not lw then
set lc=false
set Oc=true
endif
if not Oc then
set oc=StringHash(nc)
endif
if not Oc then
set lc=oc==ow or oc==Ow
set Oc=true
endif
if not Oc then
set lc=false
endif
set Oc=lc
else
set Oc=false
endif
exitwhen not Oc
set Sc=Sc+1
set rc=br[ic]
set tc=yr[ic]
set cc=yr[ic]+Sc
set rc=SubString(rc,tc,cc)
endloop
endif
endif
set yr[ic]=yr[ic]+Sc
endif
if not bc then
if rc=="\\" or rc=="\"" or rc=="\n" or rc=="\r" then
if not bc then
set ic=uc
set qr[er]="when calling close in FileIO, line 116"
set er=er+1
set qr[er]="when calling dispatch_StringIterator_destroyStringIterator in String, line 410"
set er=er+1
if Qu[ic]==0 then
if ic==0 then
call Ni("Nullpointer exception when calling StringIterator.StringIterator","when calling error in String, line 377")
else
call Ni("Called StringIterator.StringIterator on invalid object.","when calling error in String, line 377")
endif
endif
set qr[er]="when calling destroyStringIterator in String, line 377"
set er=er+1
set qr[er]="when calling dealloc_StringIterator in String, line 377"
set er=er+1
if Qu[ic]==0 then
call Ni("Double free: object of type StringIterator","when calling error in String, line 377")
else
set xu[vu]=ic
set vu=vu+1
set Qu[ic]=0
endif
set er=er-1-1-1-1
endif
if not bc then
set er=er-1
endif
if not bc then
set yc=rc
set bc=true
endif
endif
endif
endloop
if not bc then
set ic=uc
set qr[er]="when calling close in FileIO, line 116"
set er=er+1
set qr[er]="when calling dispatch_StringIterator_destroyStringIterator in String, line 410"
set er=er+1
if Qu[ic]==0 then
if ic==0 then
call Ni("Nullpointer exception when calling StringIterator.StringIterator","when calling error in String, line 377")
else
call Ni("Called StringIterator.StringIterator on invalid object.","when calling error in String, line 377")
endif
endif
set qr[er]="when calling destroyStringIterator in String, line 377"
set er=er+1
set qr[er]="when calling dealloc_StringIterator in String, line 377"
set er=er+1
if Qu[ic]==0 then
call Ni("Double free: object of type StringIterator","when calling error in String, line 377")
else
set xu[vu]=ic
set vu=vu+1
set Qu[ic]=0
endif
set er=er-1-1-1-1
endif
if not bc then
set er=er-1
endif
if not bc then
set yc=null
set bc=true
endif
if not bc then
set yc=null
endif
if yc!=null then
set nc="FileIO("+Vu[BS]+") ERROR: Invalid character |cffffcc00"
set bc=false
set qr[er]="when calling validateInput in FileIO, line 59"
set er=er+1
set sc=CS
set qr[er]="when calling iterator in FileIO, line 116"
set er=er+1
set CS=sc
set uc=StringLength(sc)
set qr[er]="when calling new_StringIterator in String, line 375"
set er=er+1
set qr[er]="when calling alloc_StringIterator in String, line 382"
set er=er+1
if vu==0 then
if mu<JASS_MAX_ARRAY_SIZE then
set mu=mu+1
set ic=mu
set Qu[ic]=969
else
call Ni("Out of memory: Could not create StringIterator.","when calling error in String, line 377")
set ic=0
endif
else
set vu=vu-1
set ic=xu[vu]
set Qu[ic]=969
endif
set er=er-1
set Sc=ic
set br[Sc]=CS
set yr[Sc]=0
set pr[Sc]=uc
set er=er-1
set uc=ic
set er=er-1
loop
exitwhen bc
if not bc then
set ic=uc
exitwhen yr[ic]>=pr[ic]
endif
if not bc then
set ic=uc
set CS=br[ic]
set Sc=yr[ic]
set tc=yr[ic]+1
set CS=SubString(CS,Sc,tc)
set Sc=1
if Sw and lw then
set pc=CS
set tc=StringHash(pc)
if pw!=ow and tc==pw then
set Sc=4
set CS=br[ic]
set tc=yr[ic]
set cc=yr[ic]+4
set CS=SubString(CS,tc,cc)
elseif tc==ow or tc==Ow then
set Sc=2
set CS=br[ic]
set tc=yr[ic]
set cc=yr[ic]+2
set CS=SubString(CS,tc,cc)
loop
if Sc<4 and yr[ic]+Sc<pr[ic]then
set pc=CS
set Oc=false
if not lw then
set qc=false
set Oc=true
endif
if not Oc then
set ec=StringHash(pc)
endif
if not Oc then
set qc=ec==ow or ec==Ow
set Oc=true
endif
if not Oc then
set qc=false
endif
set Oc=qc
else
set Oc=false
endif
exitwhen not Oc
set Sc=Sc+1
set CS=br[ic]
set tc=yr[ic]
set cc=yr[ic]+Sc
set CS=SubString(CS,tc,cc)
endloop
endif
endif
set yr[ic]=yr[ic]+Sc
set pc=CS
endif
if not bc then
if pc=="\\" or pc=="\"" or pc=="\n" or pc=="\r" then
if not bc then
set ic=uc
set qr[er]="when calling close in FileIO, line 116"
set er=er+1
set qr[er]="when calling dispatch_StringIterator_destroyStringIterator in String, line 410"
set er=er+1
if Qu[ic]==0 then
if ic==0 then
call Ni("Nullpointer exception when calling StringIterator.StringIterator","when calling error in String, line 377")
else
call Ni("Called StringIterator.StringIterator on invalid object.","when calling error in String, line 377")
endif
endif
set qr[er]="when calling destroyStringIterator in String, line 377"
set er=er+1
set qr[er]="when calling dealloc_StringIterator in String, line 377"
set er=er+1
if Qu[ic]==0 then
call Ni("Double free: object of type StringIterator","when calling error in String, line 377")
else
set xu[vu]=ic
set vu=vu+1
set Qu[ic]=0
endif
set er=er-1-1-1-1
endif
if not bc then
set er=er-1
endif
if not bc then
set ac=pc
set bc=true
endif
endif
endif
endloop
if not bc then
set ic=uc
set qr[er]="when calling close in FileIO, line 116"
set er=er+1
set qr[er]="when calling dispatch_StringIterator_destroyStringIterator in String, line 410"
set er=er+1
if Qu[ic]==0 then
if ic==0 then
call Ni("Nullpointer exception when calling StringIterator.StringIterator","when calling error in String, line 377")
else
call Ni("Called StringIterator.StringIterator on invalid object.","when calling error in String, line 377")
endif
endif
set qr[er]="when calling destroyStringIterator in String, line 377"
set er=er+1
set qr[er]="when calling dealloc_StringIterator in String, line 377"
set er=er+1
if Qu[ic]==0 then
call Ni("Double free: object of type StringIterator","when calling error in String, line 377")
else
set xu[vu]=ic
set vu=vu+1
set Qu[ic]=0
endif
set er=er-1-1-1-1
endif
if not bc then
set er=er-1
endif
if not bc then
set ac=null
set bc=true
endif
if not bc then
set ac=null
endif
call Ni(nc+ac+"|r","when calling error in FileIO, line 59")
endif
set MS=MS+1
endloop
endif
set oc=BS
set ec=NS
set qr[er]="when calling writePreload in FileIO, line 61"
set er=er+1
if Ou[oc]==0 then
if oc==0 then
call Ni("Nullpointer exception when calling File.writePreload","when calling error in FileIO, line 82")
else
call Ni("Called File.writePreload on invalid object.","when calling error in FileIO, line 82")
endif
endif
set qr[er]="when calling writePreload in FileIO, line 82"
set er=er+1
if rw==XS then
call PreloadGenClear()
call PreloadGenStart()
if Ec(ec,"when calling getChunkCount in FileIO, line 87")>=X then
set CS="FileIO("+Vu[oc]+") ERROR: String's chunk count exceeds the limit ("
set BS=X
call Ni(CS+I2S(BS)+").|r","when calling error in FileIO, line 88")
endif
set BS=0
set NS=Ec(ec,"when calling getChunkCount in FileIO, line 90")-1
loop
exitwhen BS>NS
set CS=ht(ec,BS,"when calling getChunk in FileIO, line 91")
set CS="\" )\ncall BlzSetAbilityTooltip('"+V+"', \""+CS+"\", "
set MS=BS
call Preload(CS+I2S(MS)+")\n//")
set BS=BS+1
endloop
call Preload("\" )\nendfunction\nfunction a takes nothing returns nothing\n //")
call PreloadGenEnd(Vu[oc])
endif
set er=er-1-1-1-1
call ao(LS,"when calling dispatch_ChunkedString_destroyChunkedString in FileIO, line 52")
set er=er-1-1
endfunction
function wl takes string CO,string VO returns integer
local integer BO
local integer NO
local integer MO
set qr[er]=VO
set er=er+1
set qr[er]="when calling alloc_File in FileIO, line 45"
set er=er+1
if cu==0 then
if ou<JASS_MAX_ARRAY_SIZE then
set ou=ou+1
set BO=ou
set Ou[BO]=900
else
call Ni("Out of memory: Could not create File.","when calling error in FileIO, line 42")
set BO=0
endif
else
set cu=cu-1
set BO=Su[cu]
set Ou[BO]=900
endif
set er=er-1
set NO=BO
set MO=NO
set Vu[MO]=""
set Vu[NO]=CO
set er=er-1
return BO
endfunction
function US takes string hS,string FS,string kS returns nothing
local integer jS
local string xS
local integer vS
local integer mS
local integer QS
local string WS
local integer ES
local player ZS
set qr[er]=kS
set er=er+1
set x=x+1
set WS="{"+"\""+"v"+"\""+":"+I2S(p)+","
set WS=WS+"\""+"projectId"+"\""+":"
set xS=g
set WS=WS+"\""+xS+"\""+","
set WS=WS+"\""+"buildId"+"\""+":"
set xS=h
set WS=WS+"\""+xS+"\""+","
set WS=WS+"\""+"runId"+"\""+":"
set xS=F
set WS=WS+"\""+xS+"\""+","
set WS=WS+"\""+"nonce"+"\""+":"
set xS=k
set WS=WS+"\""+xS+"\""+","
set WS=WS+"\""+"suiteId"+"\""+":"
set xS=j
set WS=WS+"\""+xS+"\""+","
set WS=WS+"\""+"seq"+"\""+":"+I2S(x)+","
set xS="state"
set xS=WS+"\""+xS+"\""+":"
set xS=xS+"\""+hS+"\""+","
set xS=xS+"\""+"gameTime"+"\""+":"+R2S(m)+","
set xS=xS+"\""+"heartbeat"+"\""+":"+I2S(v)+","
set hS="payload"
set hS=xS+"\""+hS+"\""+":"+FS+"}"
set xS="wc3-e2e/"+g+"/output-"
if P then
set FS="a"
else
set FS="b"
endif
set FS=xS+FS+".pld"
set P=not P
set jS=wl(FS,"when calling new_File in E2E, line 242")
set ES=jS
set ZS=GetLocalPlayer()
set FS=""
set vS=0
set xS=hS
set mS=StringLength(xS)-1
loop
exitwhen vS>mS
set xS=hS
set QS=vS
set xS=SubString(xS,QS,QS+1)
if xS=="~" then
set FS=FS+"~~"
elseif xS=="\"" then
set FS=FS+"~q"
elseif xS=="\\" then
set FS=FS+"~b"
else
set FS=FS+xS
endif
set vS=vS+1
endloop
set hS=FS
set qr[er]="when calling encodeFrame in E2E, line 242"
set er=er+1
set FS=hS
set hS="E2E1|"+I2S(StringLength(FS))+"|"+HO(hS,"when calling fnv1a32Hex in E2EProtocol, line 96")+"|"+hS+"|END"
set er=er-1
call dc(ES,ZS,hS,"when calling write in E2E, line 242")
set qr[er]="when calling close in E2E, line 242"
set er=er+1
if Ou[jS]==0 then
if jS==0 then
call Ni("Nullpointer exception when calling File.close","when calling error in FileIO, line 63")
else
call Ni("Called File.close on invalid object.","when calling error in FileIO, line 63")
endif
endif
set qr[er]="when calling close in FileIO, line 63"
set er=er+1
call aS(jS,"when calling dispatch_File_destroyFile in FileIO, line 64")
set er=er-1-1-1
set ZS=null
endfunction
function et takes timer Ot,string lt returns integer
local integer bt
local integer yt
local hashtable pt
set qr[er]=lt
set er=er+1
set yt=Yw
set bt=wS(Ot)
set qr[er]="when calling loadInt in TimerUtils, line 22"
set er=er+1
if qu[yt]==0 then
if yt==0 then
call Ni("Nullpointer exception when calling Table.loadInt","when calling error in Table, line 40")
else
call Ni("Called Table.loadInt on invalid object.","when calling error in Table, line 40")
endif
endif
set pt=fw
set yt=yt
set bt=LoadInteger(pt,yt,bt)
set er=er-1-1
set pt=null
return bt
endfunction
function ct takes nothing returns nothing
local integer ut
local integer rt
local timer st
local timer tt
local boolean St
set qr[er]="via function reference ClosureTimers, line 159"
set er=er+1
set ut=et(GetExpiredTimer(),"when calling getData in ClosureTimers, line 162")
set rt=ut
set qr[er]="when calling call in ClosureTimers, line 163"
set er=er+1
if Vw[rt]==0 then
if rt==0 then
call Ni("Nullpointer exception when calling CallbackPeriodic.call","when calling error in ClosureTimers, line 154")
else
call Ni("Called CallbackPeriodic.call on invalid object.","when calling error in ClosureTimers, line 154")
endif
endif
set rt=ut
set qr[er]="when calling call_doPeriodically_E2E_E2E in ClosureTimers, line 154"
set er=er+1
if Y then
set qr[er]="when calling dispatch_CallbackPeriodic_destroyCallbackPeriodic in E2E, line 198"
set er=er+1
if Vw[rt]==0 then
if rt==0 then
call Ni("Nullpointer exception when calling CallbackPeriodic.CallbackPeriodic","when calling error in ClosureTimers, line 150")
else
call Ni("Called CallbackPeriodic.CallbackPeriodic on invalid object.","when calling error in ClosureTimers, line 150")
endif
endif
set qr[er]="when calling destroyCallbackPeriodic in ClosureTimers, line 150"
set er=er+1
set ut=rt
set qr[er]="when calling CallbackPeriodic_onDestroy in ClosureTimers, line 176"
set er=er+1
set st=Au[ut]
set St=false
set qr[er]="when calling release in ClosureTimers, line 177"
set er=er+1
if st==null then
call Ni("Trying to release a null timer","when calling error in TimerUtils, line 38")
set er=er-1
set St=true
endif
if not St then
if et(st,"when calling getData in TimerUtils, line 40")==Gw then
if not St then
call Ni("ReleaseTimer: Double free!","when calling error in TimerUtils, line 41")
endif
if not St then
set er=er-1
endif
if not St then
set St=true
endif
endif
endif
if not St then
call KS(st,Gw,"when calling setData in TimerUtils, line 43")
endif
if not St then
set tt=st
call PauseTimer(tt)
endif
if not St then
set Rw[Tw]=st
endif
if not St then
set Tw=Tw+1
endif
if not St then
set er=er-1
endif
set er=er-1
set qr[er]="when calling dealloc_CallbackPeriodic in ClosureTimers, line 176"
set er=er+1
if Vw[rt]==0 then
call Ni("Double free: object of type CallbackPeriodic","when calling error in ClosureTimers, line 150")
else
set Lw[Xw]=rt
set Xw=Xw+1
set Vw[rt]=0
endif
set er=er-1-1-1
else
set m=m+e
if not G then
set v=v+1
call US("RUNNING","{}","when calling emit in E2E, line 203")
endif
endif
set er=er-1-1-1
set st=null
set tt=null
endfunction
function dO takes nothing returns boolean
set K=0
set L=""
return true
endfunction
function dS takes nothing returns boolean
set fw=hw
return true
endfunction
function gi takes integer ai,player ni,string di returns string
local string fi
local integer Ri
local integer Ti
local integer Yi
local integer Gi
set qr[er]=di
set er=er+1
if Ou[ai]==0 then
if ai==0 then
call Ni("Nullpointer exception when calling File.readAsString","when calling error in FileIO, line 76")
else
call Ni("Called File.readAsString on invalid object.","when calling error in FileIO, line 76")
endif
endif
set qr[er]="when calling readAsString in FileIO, line 76"
set er=er+1
set qr[er]="when calling read in FileIO, line 77"
set er=er+1
if Ou[ai]==0 then
if ai==0 then
call Ni("Nullpointer exception when calling File.read","when calling error in FileIO, line 69")
else
call Ni("Called File.read on invalid object.","when calling error in FileIO, line 69")
endif
endif
set qr[er]="when calling read in FileIO, line 69"
set er=er+1
set Ti=r
set qr[er]="when calling new_ChunkedString in FileIO, line 70"
set er=er+1
set qr[er]="when calling alloc_ChunkedString in ChunkedString, line 41"
set er=er+1
if Pw==0 then
if Aw<JASS_MAX_ARRAY_SIZE then
set Aw=Aw+1
set Ri=Aw
set Dw[Ri]=885
else
call Ni("Out of memory: Could not create ChunkedString.","when calling error in ChunkedString, line 32")
set Ri=0
endif
else
set Pw=Pw-1
set Ri=Iw[Pw]
set Dw[Ri]=885
endif
set er=er-1
set Yi=Ri
set qr[er]="when calling construct_ChunkedString2 in ChunkedString, line 41"
set er=er+1
set Gi=Yi
set qr[er]="when calling ChunkedString_init in ChunkedString, line 41"
set er=er+1
set Wu[Gi]=fo("when calling new_Table in ChunkedString, line 33")
set Eu[Gi]=r
set Zu[Gi]=0
set Uu[Gi]=""
set er=er-1
set Eu[Yi]=Ti
set er=er-1-1
if rw==ni then
set Yi=ai
set ai=Ri
set qr[er]="when calling readPreload in FileIO, line 72"
set er=er+1
if Ou[Yi]==0 then
if Yi==0 then
call Ni("Nullpointer exception when calling File.readPreload","when calling error in FileIO, line 97")
else
call Ni("Called File.readPreload on invalid object.","when calling error in FileIO, line 97")
endif
endif
set qr[er]="when calling readPreload in FileIO, line 97"
set er=er+1
call Preloader(Vu[Yi])
set Yi=0
set Gi=X-1
loop
exitwhen Yi>Gi
set fi=BlzGetAbilityTooltip(1160922438,Yi)
exitwhen fi==" "
call BlzSetAbilityTooltip(1160922438," ",Yi)
call aO(ai,fi,"when calling append in FileIO, line 108")
set Yi=Yi+1
endloop
set er=er-1-1
endif
set er=er-1
set ai=Ri
set er=er-1
set Ri=ai
set qr[er]="when calling getUnsafeString in FileIO, line 78"
set er=er+1
if Dw[Ri]==0 then
if Ri==0 then
call Ni("Nullpointer exception when calling ChunkedString.getUnsafeString","when calling error in ChunkedString, line 107")
else
call Ni("Called ChunkedString.getUnsafeString on invalid object.","when calling error in ChunkedString, line 107")
endif
endif
set qr[er]="when calling getUnsafeString in ChunkedString, line 107"
set er=er+1
set fi=""
set Yi=0
set Gi=Ec(Ri,"when calling getChunkCount in ChunkedString, line 109")-1
loop
exitwhen Yi>Gi
set fi=fi+ht(Ri,Yi,"when calling getChunk in ChunkedString, line 110")
set Yi=Yi+1
endloop
set er=er-1-1
call ao(ai,"when calling dispatch_ChunkedString_destroyChunkedString in FileIO, line 79")
set er=er-1-1
return fi
endfunction
function gS takes nothing returns boolean
local integer fS
local string RS
local integer TS
local integer YS
local integer GS
set qr[er]="via function reference FileIO, line 1"
set er=er+1
set X=64
set C=true
set RS=""
set TS=1160922438
set YS=0
loop
exitwhen YS>3
set GS=ModuloInteger(TS,256)
set TS=TS/256
set RS=SubString(".................................!.#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[.]^_`abcdefghijklmnopqrstuvwxyz{|}~.................................................................................................................................",GS,GS+1)+RS
set YS=YS+1
endloop
set V=RS
set fS=wl("FileTester.pld","when calling new_File in FileIO, line 122")
call dc(fS,rw,"test","when calling write in FileIO, line 123")
set C=gi(fS,rw,"when calling readAsString in FileIO, line 124")=="test"
call aS(fS,"when calling dispatch_File_destroyFile in FileIO, line 125")
set er=er-1
return true
endfunction
function ll takes nothing returns boolean
local integer Ol
set qr[er]="via function reference E2E, line 1"
set er=er+1
set p=2
set e=2.0
set q=8
set a=128
set n=128
set qr[er]="when calling new_LinkedList in E2E, line 67"
set er=er+1
set qr[er]="when calling alloc_LinkedList in LinkedList, line 31"
set er=er+1
if Fu==0 then
if ku<JASS_MAX_ARRAY_SIZE then
set ku=ku+1
set Ol=ku
set ju[Ol]=956
else
call Ni("Out of memory: Could not create LinkedList.","when calling error in LinkedList, line 17")
set Ol=0
endif
else
set Fu=Fu-1
set Ol=hu[Fu]
set ju[Ol]=956
endif
set er=er-1
set qr[er]="when calling construct_LinkedList2 in LinkedList, line 31"
set er=er+1
set qr[er]="when calling LinkedList_init in LinkedList, line 31"
set er=er+1
set cr[Ol]=No(0,0,0,"when calling new_LLEntry in LinkedList, line 18")
set lr[Ol]=0
set er=er-1
set rr[cr[Ol]]=cr[Ol]
set ur[cr[Ol]]=cr[Ol]
set er=er-1-1
set d=Ol
set qr[er]="when calling new_LinkedList in E2E, line 68"
set er=er+1
set qr[er]="when calling alloc_LinkedList in LinkedList, line 31"
set er=er+1
if Fu==0 then
if ku<JASS_MAX_ARRAY_SIZE then
set ku=ku+1
set Ol=ku
set ju[Ol]=956
else
call Ni("Out of memory: Could not create LinkedList.","when calling error in LinkedList, line 17")
set Ol=0
endif
else
set Fu=Fu-1
set Ol=hu[Fu]
set ju[Ol]=956
endif
set er=er-1
set qr[er]="when calling construct_LinkedList2 in LinkedList, line 31"
set er=er+1
set qr[er]="when calling LinkedList_init in LinkedList, line 31"
set er=er+1
set cr[Ol]=No(0,0,0,"when calling new_LLEntry in LinkedList, line 18")
set lr[Ol]=0
set er=er-1
set rr[cr[Ol]]=cr[Ol]
set ur[cr[Ol]]=cr[Ol]
set er=er-1-1
set f=Ol
set qr[er]="when calling new_LinkedList in E2E, line 69"
set er=er+1
set qr[er]="when calling alloc_LinkedList in LinkedList, line 31"
set er=er+1
if Fu==0 then
if ku<JASS_MAX_ARRAY_SIZE then
set ku=ku+1
set Ol=ku
set ju[Ol]=956
else
call Ni("Out of memory: Could not create LinkedList.","when calling error in LinkedList, line 17")
set Ol=0
endif
else
set Fu=Fu-1
set Ol=hu[Fu]
set ju[Ol]=956
endif
set er=er-1
set qr[er]="when calling construct_LinkedList2 in LinkedList, line 31"
set er=er+1
set qr[er]="when calling LinkedList_init in LinkedList, line 31"
set er=er+1
set cr[Ol]=No(0,0,0,"when calling new_LLEntry in LinkedList, line 18")
set lr[Ol]=0
set er=er-1
set rr[cr[Ol]]=cr[Ol]
set ur[cr[Ol]]=cr[Ol]
set er=er-1-1
set R=Ol
set T=false
set Y=false
set G=false
set g=""
set h=""
set F=""
set k=""
set j=""
set x=0
set v=0
set m=0.
set Q=0
set W=0
set E=0
set Z=0
set U=""
set I=0
set P=true
set er=er-1
return true
endfunction
function nO takes nothing returns boolean
set qr[er]="via function reference LinkedList, line 1"
set er=er+1
set qr[er]="when calling alloc_Comparator_LinkedList in LinkedList, line 596"
set er=er+1
if au==0 then
if nu<JASS_MAX_ARRAY_SIZE then
set nu=nu+1
else
call Ni("Out of memory: Could not create Comparator_LinkedList.","when calling error in LinkedList, line 596")
endif
else
set au=au-1
endif
set er=er-1
set qr[er]="when calling alloc_Comparator_LinkedList in LinkedList, line 600"
set er=er+1
if au==0 then
if nu<JASS_MAX_ARRAY_SIZE then
set nu=nu+1
else
call Ni("Out of memory: Could not create Comparator_LinkedList.","when calling error in LinkedList, line 600")
endif
else
set au=au-1
endif
set er=er-1
set qr[er]="when calling alloc_Comparator_LinkedList in LinkedList, line 604"
set er=er+1
if au==0 then
if nu<JASS_MAX_ARRAY_SIZE then
set nu=nu+1
else
call Ni("Out of memory: Could not create Comparator_LinkedList.","when calling error in LinkedList, line 604")
endif
else
set au=au-1
endif
set er=er-1-1
return true
endfunction
function nS takes nothing returns boolean
set ww=false
set uw=false
return true
endfunction
function ns takes nothing returns nothing
set B=B+w
endfunction
function pS takes nothing returns boolean
local integer bS
local integer yS
set rw=GetLocalPlayer()
set bS=0
set yS=bj_MAX_PLAYER_SLOTS-1
loop
exitwhen bS>yS
set bS=bS+1
endloop
return true
endfunction
function ro takes nothing returns boolean
local string Bc
local integer Nc
local integer Mc
local integer wo
local hashtable uo
set qr[er]="via function reference Colors, line 1"
set er=er+1
set b[0]="0"
set b[1]="1"
set b[2]="2"
set b[3]="3"
set b[4]="4"
set b[5]="5"
set b[6]="6"
set b[7]="7"
set b[8]="8"
set b[9]="9"
set b[10]="A"
set b[11]="B"
set b[12]="C"
set b[13]="D"
set b[14]="E"
set b[15]="F"
set y=fo("when calling new_Table in Colors, line 14")
set qr[er]="when calling initializeTable in Colors, line 276"
set er=er+1
set Nc=0
loop
exitwhen Nc>15
set Mc=y
set Bc=b[Nc]
set wo=StringHash(Bc)
set qr[er]="when calling saveInt in Colors, line 273"
set er=er+1
if qu[Mc]==0 then
if Mc==0 then
call Ni("Nullpointer exception when calling Table.saveInt","when calling error in Table, line 43")
else
call Ni("Called Table.saveInt on invalid object.","when calling error in Table, line 43")
endif
endif
set uo=fw
set Mc=Mc
call SaveInteger(uo,Mc,wo,Nc)
set er=er-1
set Nc=Nc+1
endloop
set er=er-1-1
set uo=null
return true
endfunction
function Es takes real ks,integer js,string xs returns integer
local integer vs
local code ms
local timer Qs
local timer Ws
set qr[er]=xs
set er=er+1
set qr[er]="when calling getTimer in ClosureTimers, line 27"
set er=er+1
if Tw>0 then
set Tw=Tw-1
call KS(Rw[Tw],0,"when calling setData in TimerUtils, line 30")
set er=er-1
set Qs=Rw[Tw]
else
set Qs=CreateTimer()
call KS(Qs,0,"when calling setData in TimerUtils, line 33")
set Ws=Qs
set er=er-1
set Qs=Ws
endif
set Qs=Qs
set qr[er]="when calling doAfter in ClosureTimers, line 27"
set er=er+1
set vs=js
set qr[er]="when calling start in ClosureTimers, line 16"
set er=er+1
if Uw[vs]==0 then
if vs==0 then
call Ni("Nullpointer exception when calling CallbackSingle.start","when calling error in ClosureTimers, line 131")
else
call Ni("Called CallbackSingle.start on invalid object.","when calling error in ClosureTimers, line 131")
endif
endif
set qr[er]="when calling start in ClosureTimers, line 131"
set er=er+1
call KS(Qs,vs,"when calling setData in ClosureTimers, line 133")
set Ws=Qs
set ms=os
call TimerStart(Ws,ks,false,ms)
set Du[vs]=Qs
set er=er-1-1-1-1
set Qs=null
set Ws=null
return js
endfunction
function qi takes string At,string Dt returns nothing
local string Ht
local string Jt
local integer Kt
local string Lt
local integer Xt
local string Ct
local string Vt
local string Bt
local boolean Nt
local boolean Mt
local integer wi
local integer ui
local string ri
local string si
local string ti
local string ii
local string Si
local string ci
local string oi
local string Oi
local string li
local string bi
local string yi
local string pi
local boolean ei
set qr[er]=Dt
set er=er+1
set Jt=gi(wl("wc3-e2e/"+At+"/armed.pld","when calling new_File in E2E, line 97"),GetLocalPlayer(),"when calling readAsString in E2E, line 98")
set Nt=false
set qr[er]="when calling decodeFrame in E2E, line 99"
set er=er+1
set Bt=Jt
if StringLength(Bt)<19 then
set ei=true
else
set Bt=Jt
set ei=SubString(Bt,0,5)!="E2E1|"
endif
if ei then
set er=er-1
set Mt=false
set Ht=""
set Nt=true
endif
if not Nt then
set Kt=5
endif
if not Nt then
set Lt=""
endif
if not Nt then
loop
exitwhen Nt
if not Nt then
set wi=Kt
set Bt=Jt
if wi<StringLength(Bt) then
set Bt=Jt
set wi=Kt
set ei=SubString(Bt,wi,wi+1)!="|"
else
set ei=false
endif
exitwhen not ei
endif
if not Nt then
set Bt=Lt
set Lt=Jt
set wi=Kt
set Lt=Bt+SubString(Lt,wi,wi+1)
endif
if not Nt then
set Kt=Kt+1
endif
endloop
endif
if not Nt then
set Bt=Lt
if StringLength(Bt)==0 then
set ei=true
else
set wi=Kt
set Bt=Jt
set ei=wi>=StringLength(Bt)
endif
if ei then
if not Nt then
set er=er-1
endif
if not Nt then
set Mt=false
set Ht=""
set Nt=true
endif
endif
endif
if not Nt then
set Xt=S2I(Lt)
endif
if not Nt then
set Kt=Kt+1
endif
if not Nt then
set wi=Kt+8
set Lt=Jt
if wi>=StringLength(Lt) then
if not Nt then
set er=er-1
endif
if not Nt then
set Mt=false
set Ht=""
set Nt=true
endif
endif
endif
if not Nt then
set Ct=Jt
set wi=Kt
set ui=Kt+8
set Ct=SubString(Ct,wi,ui)
endif
if not Nt then
set Kt=Kt+8
endif
if not Nt then
set Lt=Jt
set wi=Kt
if SubString(Lt,wi,wi+1)!="|" then
if not Nt then
set er=er-1
endif
if not Nt then
set Mt=false
set Ht=""
set Nt=true
endif
endif
endif
if not Nt then
set Kt=Kt+1
endif
if not Nt then
set Lt=Jt
if StringLength(Lt)!=Kt+Xt+4 then
if not Nt then
set er=er-1
endif
if not Nt then
set Mt=false
set Ht=""
set Nt=true
endif
endif
endif
if not Nt then
set Vt=Jt
set wi=Kt
set ui=Kt+Xt
set Vt=SubString(Vt,wi,ui)
endif
if not Nt then
set Lt=Jt
set Kt=Kt+Xt
set Xt=StringLength(Jt)
if SubString(Lt,Kt,Xt)!="|END" then
if not Nt then
set er=er-1
endif
if not Nt then
set Mt=false
set Ht=""
set Nt=true
endif
endif
endif
if not Nt then
if HO(Vt,"when calling fnv1a32Hex in E2EProtocol, line 124")!=Ct then
if not Nt then
set er=er-1
endif
if not Nt then
set Mt=false
set Ht=""
set Nt=true
endif
endif
endif
if not Nt then
set er=er-1
endif
if not Nt then
set Ht=Vt
set Mt=true
set Nt=true
endif
if not Nt then
set Mt=false
set Ht=null
endif
set Nt=Mt
if not Nt then
set er=er-1
return
endif
set Ct=Ht
set Nt=false
set Lt="v"+"="
set wi=0
set ui=0
loop
exitwhen Nt
if not Nt then
set Kt=ui
set Vt=Ct
exitwhen Kt>StringLength(Vt)
endif
if not Nt then
set Kt=ui
set Vt=Ct
if Kt==StringLength(Vt) then
set Mt=true
else
set Vt=Ct
set Kt=ui
set Mt=SubString(Vt,Kt,Kt+1)==";"
endif
if Mt then
if not Nt then
set ri=Ct
set Kt=wi
set Xt=ui
set ri=SubString(ri,Kt,Xt)
endif
if not Nt then
set Vt=ri
set Kt=StringLength(Vt)
set Vt=Lt
if Kt>StringLength(Vt) then
set Vt=ri
set Jt=Lt
set Xt=StringLength(Jt)
set Mt=SubString(Vt,0,Xt)==Lt
else
set Mt=false
endif
if Mt then
if not Nt then
set si=ri
set Vt=Lt
set Kt=StringLength(Vt)
set Vt=ri
set Xt=StringLength(Vt)
set si=SubString(si,Kt,Xt)
set Nt=true
endif
endif
endif
if not Nt then
set wi=ui+1
endif
endif
endif
if not Nt then
set ui=ui+1
endif
endloop
if not Nt then
set si=""
set Nt=true
endif
if not Nt then
set si=null
endif
if si!=I2S(p) then
set er=er-1
return
endif
set Lt=Ht
set Nt=false
set Jt="projectId"+"="
set Kt=0
set Xt=0
loop
exitwhen Nt
if not Nt then
set wi=Xt
set ri=Lt
exitwhen wi>StringLength(ri)
endif
if not Nt then
set wi=Xt
set ri=Lt
if wi==StringLength(ri) then
set Mt=true
else
set ri=Lt
set wi=Xt
set Mt=SubString(ri,wi,wi+1)==";"
endif
if Mt then
if not Nt then
set ti=Lt
set wi=Kt
set ui=Xt
set ti=SubString(ti,wi,ui)
endif
if not Nt then
set ri=ti
set wi=StringLength(ri)
set ri=Jt
if wi>StringLength(ri) then
set ri=ti
set si=Jt
set ui=StringLength(si)
set Mt=SubString(ri,0,ui)==Jt
else
set Mt=false
endif
if Mt then
if not Nt then
set ii=ti
set ri=Jt
set wi=StringLength(ri)
set ri=ti
set ui=StringLength(ri)
set ii=SubString(ii,wi,ui)
set Nt=true
endif
endif
endif
if not Nt then
set Kt=Xt+1
endif
endif
endif
if not Nt then
set Xt=Xt+1
endif
endloop
if not Nt then
set ii=""
set Nt=true
endif
if not Nt then
set ii=null
endif
if ii!=At then
set er=er-1
return
endif
set g=At
set Jt=Ht
set Nt=false
set ri="buildId"+"="
set wi=0
set ui=0
loop
exitwhen Nt
if not Nt then
set Kt=ui
set ti=Jt
exitwhen Kt>StringLength(ti)
endif
if not Nt then
set Kt=ui
set ti=Jt
if Kt==StringLength(ti) then
set Mt=true
else
set ti=Jt
set Kt=ui
set Mt=SubString(ti,Kt,Kt+1)==";"
endif
if Mt then
if not Nt then
set Si=Jt
set Kt=wi
set Xt=ui
set Si=SubString(Si,Kt,Xt)
endif
if not Nt then
set ti=Si
set Kt=StringLength(ti)
set ti=ri
if Kt>StringLength(ti) then
set ti=Si
set ii=ri
set Xt=StringLength(ii)
set Mt=SubString(ti,0,Xt)==ri
else
set Mt=false
endif
if Mt then
if not Nt then
set ci=Si
set ti=ri
set Kt=StringLength(ti)
set ti=Si
set Xt=StringLength(ti)
set ci=SubString(ci,Kt,Xt)
set Nt=true
endif
endif
endif
if not Nt then
set wi=ui+1
endif
endif
endif
if not Nt then
set ui=ui+1
endif
endloop
if not Nt then
set ci=""
set Nt=true
endif
if not Nt then
set ci=null
endif
set h=ci
set ri=Ht
set Nt=false
set ti="runId"+"="
set Kt=0
set Xt=0
loop
exitwhen Nt
if not Nt then
set wi=Xt
set Si=ri
exitwhen wi>StringLength(Si)
endif
if not Nt then
set wi=Xt
set Si=ri
if wi==StringLength(Si) then
set Mt=true
else
set Si=ri
set wi=Xt
set Mt=SubString(Si,wi,wi+1)==";"
endif
if Mt then
if not Nt then
set oi=ri
set wi=Kt
set ui=Xt
set oi=SubString(oi,wi,ui)
endif
if not Nt then
set Si=oi
set wi=StringLength(Si)
set Si=ti
if wi>StringLength(Si) then
set Si=oi
set ci=ti
set ui=StringLength(ci)
set Mt=SubString(Si,0,ui)==ti
else
set Mt=false
endif
if Mt then
if not Nt then
set Oi=oi
set Si=ti
set wi=StringLength(Si)
set Si=oi
set ui=StringLength(Si)
set Oi=SubString(Oi,wi,ui)
set Nt=true
endif
endif
endif
if not Nt then
set Kt=Xt+1
endif
endif
endif
if not Nt then
set Xt=Xt+1
endif
endloop
if not Nt then
set Oi=""
set Nt=true
endif
if not Nt then
set Oi=null
endif
set F=Oi
set ti=Ht
set Nt=false
set Si="nonce"+"="
set wi=0
set ui=0
loop
exitwhen Nt
if not Nt then
set Kt=ui
set oi=ti
exitwhen Kt>StringLength(oi)
endif
if not Nt then
set Kt=ui
set oi=ti
if Kt==StringLength(oi) then
set Mt=true
else
set oi=ti
set Kt=ui
set Mt=SubString(oi,Kt,Kt+1)==";"
endif
if Mt then
if not Nt then
set li=ti
set Kt=wi
set Xt=ui
set li=SubString(li,Kt,Xt)
endif
if not Nt then
set oi=li
set Kt=StringLength(oi)
set oi=Si
if Kt>StringLength(oi) then
set oi=li
set Oi=Si
set Xt=StringLength(Oi)
set Mt=SubString(oi,0,Xt)==Si
else
set Mt=false
endif
if Mt then
if not Nt then
set bi=li
set oi=Si
set Kt=StringLength(oi)
set oi=li
set Xt=StringLength(oi)
set bi=SubString(bi,Kt,Xt)
set Nt=true
endif
endif
endif
if not Nt then
set wi=ui+1
endif
endif
endif
if not Nt then
set ui=ui+1
endif
endloop
if not Nt then
set bi=""
set Nt=true
endif
if not Nt then
set bi=null
endif
set k=bi
set Si=Ht
set Nt=false
set Ht="suiteId"+"="
set Kt=0
set Xt=0
loop
exitwhen Nt
if not Nt then
set wi=Xt
set li=Si
exitwhen wi>StringLength(li)
endif
if not Nt then
set wi=Xt
set li=Si
if wi==StringLength(li) then
set Mt=true
else
set li=Si
set wi=Xt
set Mt=SubString(li,wi,wi+1)==";"
endif
if Mt then
if not Nt then
set yi=Si
set wi=Kt
set ui=Xt
set yi=SubString(yi,wi,ui)
endif
if not Nt then
set li=yi
set wi=StringLength(li)
set li=Ht
if wi>StringLength(li) then
set li=yi
set bi=Ht
set ui=StringLength(bi)
set Mt=SubString(li,0,ui)==Ht
else
set Mt=false
endif
if Mt then
if not Nt then
set pi=yi
set li=Ht
set wi=StringLength(li)
set li=yi
set ui=StringLength(li)
set pi=SubString(pi,wi,ui)
set Nt=true
endif
endif
endif
if not Nt then
set Kt=Xt+1
endif
endif
endif
if not Nt then
set Xt=Xt+1
endif
endloop
if not Nt then
set pi=""
set Nt=true
endif
if not Nt then
set pi=null
endif
set j=pi
if F=="" or k=="" or j=="" then
set er=er-1
return
endif
set T=true
set qr[er]="when calling alloc_CallbackSingle_doAfter_E2E_E2E in E2E, line 121"
set er=er+1
if Ew==0 then
if Zw<JASS_MAX_ARRAY_SIZE then
set Zw=Zw+1
set Kt=Zw
set Uw[Kt]=878
else
call Ni("Out of memory: Could not create CallbackSingle_doAfter_E2E_E2E.","when calling error in E2E, line 121")
set Kt=0
endif
else
set Ew=Ew-1
set Kt=Ww[Ew]
set Uw[Kt]=878
endif
set er=er-1
call Es(0.,Kt,"when calling doAfter in E2E, line 121")
set er=er-1
endfunction
function tS takes nothing returns boolean
local integer uS
local integer rS
local integer sS
set qr[er]="via function reference CanaryAdapter, line 1"
set er=er+1
set qr[er]="when calling alloc_E2ESuiteBody_register_CanaryAdapter in CanaryAdapter, line 18"
set er=er+1
if vw==0 then
if mw<JASS_MAX_ARRAY_SIZE then
set mw=mw+1
set sS=mw
set Qw[sS]=892
else
call Ni("Out of memory: Could not create E2ESuiteBody_register_CanaryAdapter.","when calling error in CanaryAdapter, line 18")
set sS=0
endif
else
set vw=vw-1
set sS=xw[vw]
set Qw[sS]=892
endif
set er=er-1
set uS=sS
set qr[er]="when calling register in CanaryAdapter, line 18"
set er=er+1
set sS=d
set qr[er]="when calling new_Registration in E2E, line 90"
set er=er+1
set qr[er]="when calling alloc_Registration in E2E, line 43"
set er=er+1
if tu==0 then
if iu<JASS_MAX_ARRAY_SIZE then
set iu=iu+1
set rS=iu
else
call Ni("Out of memory: Could not create Registration.","when calling error in E2E, line 39")
set rS=0
endif
else
set tu=tu-1
set rS=su[tu]
endif
set er=er-1
set Xu[rS]="canary-pass"
set Cu[rS]=uS
set er=er-1
call xi(sS,"when calling add in E2E, line 90",rS)
set er=er-1
set qr[er]="when calling alloc_E2ESuiteBody_register_CanaryAdapter in CanaryAdapter, line 26"
set er=er+1
if vw==0 then
if mw<JASS_MAX_ARRAY_SIZE then
set mw=mw+1
set sS=mw
set Qw[sS]=893
else
call Ni("Out of memory: Could not create E2ESuiteBody_register_CanaryAdapter.","when calling error in CanaryAdapter, line 26")
set sS=0
endif
else
set vw=vw-1
set sS=xw[vw]
set Qw[sS]=893
endif
set er=er-1
set uS=sS
set qr[er]="when calling register in CanaryAdapter, line 26"
set er=er+1
set sS=d
set qr[er]="when calling new_Registration in E2E, line 90"
set er=er+1
set qr[er]="when calling alloc_Registration in E2E, line 43"
set er=er+1
if tu==0 then
if iu<JASS_MAX_ARRAY_SIZE then
set iu=iu+1
set rS=iu
else
call Ni("Out of memory: Could not create Registration.","when calling error in E2E, line 39")
set rS=0
endif
else
set tu=tu-1
set rS=su[tu]
endif
set er=er-1
set Xu[rS]="canary-fail"
set Cu[rS]=uS
set er=er-1
call xi(sS,"when calling add in E2E, line 90",rS)
set er=er-1
set qr[er]="when calling alloc_E2ESuiteBody_register_CanaryAdapter in CanaryAdapter, line 32"
set er=er+1
if vw==0 then
if mw<JASS_MAX_ARRAY_SIZE then
set mw=mw+1
set sS=mw
set Qw[sS]=894
else
call Ni("Out of memory: Could not create E2ESuiteBody_register_CanaryAdapter.","when calling error in CanaryAdapter, line 32")
set sS=0
endif
else
set vw=vw-1
set sS=xw[vw]
set Qw[sS]=894
endif
set er=er-1
set uS=sS
set qr[er]="when calling register in CanaryAdapter, line 32"
set er=er+1
set sS=d
set qr[er]="when calling new_Registration in E2E, line 90"
set er=er+1
set qr[er]="when calling alloc_Registration in E2E, line 43"
set er=er+1
if tu==0 then
if iu<JASS_MAX_ARRAY_SIZE then
set iu=iu+1
set rS=iu
else
call Ni("Out of memory: Could not create Registration.","when calling error in E2E, line 39")
set rS=0
endif
else
set tu=tu-1
set rS=su[tu]
endif
set er=er-1
set Xu[rS]="canary-stall"
set Cu[rS]=uS
set er=er-1
call xi(sS,"when calling add in E2E, line 90",rS)
set er=er-1
set qr[er]="when calling alloc_E2ESuiteBody_register_CanaryAdapter in CanaryAdapter, line 37"
set er=er+1
if vw==0 then
if mw<JASS_MAX_ARRAY_SIZE then
set mw=mw+1
set sS=mw
set Qw[sS]=895
else
call Ni("Out of memory: Could not create E2ESuiteBody_register_CanaryAdapter.","when calling error in CanaryAdapter, line 37")
set sS=0
endif
else
set vw=vw-1
set sS=xw[vw]
set Qw[sS]=895
endif
set er=er-1
set uS=sS
set qr[er]="when calling register in CanaryAdapter, line 37"
set er=er+1
set sS=d
set qr[er]="when calling new_Registration in E2E, line 90"
set er=er+1
set qr[er]="when calling alloc_Registration in E2E, line 43"
set er=er+1
if tu==0 then
if iu<JASS_MAX_ARRAY_SIZE then
set iu=iu+1
set rS=iu
else
call Ni("Out of memory: Could not create Registration.","when calling error in E2E, line 39")
set rS=0
endif
else
set tu=tu-1
set rS=su[tu]
endif
set er=er-1
set Xu[rS]="canary-delay"
set Cu[rS]=uS
set er=er-1
call xi(sS,"when calling add in E2E, line 90",rS)
set er=er-1
set qr[er]="when calling alloc_E2ESuiteBody_register_CanaryAdapter in CanaryAdapter, line 42"
set er=er+1
if vw==0 then
if mw<JASS_MAX_ARRAY_SIZE then
set mw=mw+1
set sS=mw
set Qw[sS]=896
else
call Ni("Out of memory: Could not create E2ESuiteBody_register_CanaryAdapter.","when calling error in CanaryAdapter, line 42")
set sS=0
endif
else
set vw=vw-1
set sS=xw[vw]
set Qw[sS]=896
endif
set er=er-1
set uS=sS
set qr[er]="when calling register in CanaryAdapter, line 42"
set er=er+1
set sS=d
set qr[er]="when calling new_Registration in E2E, line 90"
set er=er+1
set qr[er]="when calling alloc_Registration in E2E, line 43"
set er=er+1
if tu==0 then
if iu<JASS_MAX_ARRAY_SIZE then
set iu=iu+1
set rS=iu
else
call Ni("Out of memory: Could not create Registration.","when calling error in E2E, line 39")
set rS=0
endif
else
set tu=tu-1
set rS=su[tu]
endif
set er=er-1
set Xu[rS]="canary-empty"
set Cu[rS]=uS
set er=er-1
call xi(sS,"when calling add in E2E, line 90",rS)
set er=er-1
set qr[er]="when calling alloc_E2ESuiteBody_register_CanaryAdapter in CanaryAdapter, line 45"
set er=er+1
if vw==0 then
if mw<JASS_MAX_ARRAY_SIZE then
set mw=mw+1
set sS=mw
set Qw[sS]=897
else
call Ni("Out of memory: Could not create E2ESuiteBody_register_CanaryAdapter.","when calling error in CanaryAdapter, line 45")
set sS=0
endif
else
set vw=vw-1
set sS=xw[vw]
set Qw[sS]=897
endif
set er=er-1
set uS=sS
set qr[er]="when calling register in CanaryAdapter, line 45"
set er=er+1
set sS=d
set qr[er]="when calling new_Registration in E2E, line 90"
set er=er+1
set qr[er]="when calling alloc_Registration in E2E, line 43"
set er=er+1
if tu==0 then
if iu<JASS_MAX_ARRAY_SIZE then
set iu=iu+1
set rS=iu
else
call Ni("Out of memory: Could not create Registration.","when calling error in E2E, line 39")
set rS=0
endif
else
set tu=tu-1
set rS=su[tu]
endif
set er=er-1
set Xu[rS]="canary-eval-order"
set Cu[rS]=uS
set er=er-1
call xi(sS,"when calling add in E2E, line 90",rS)
set er=er-1
call qi("canary","when calling bootstrap in CanaryAdapter, line 48")
if T then
call DisplayTimedTextToPlayer(rw,0.,0.,tw,"E2E canary armed")
endif
set er=er-1
return true
endfunction
function ul takes nothing returns boolean
set iw=true
return true
endfunction
function tl takes string sl returns nothing
endfunction
function Ut takes integer vt,string mt returns integer
local integer Qt
local integer Wt
local integer Et
local boolean Zt
set qr[er]=mt
set er=er+1
set qr[er]="when calling new_LLIterator in LinkedList, line 181"
set er=er+1
set qr[er]="when calling alloc_LLIterator in LinkedList, line 467"
set er=er+1
if Yu==0 then
if Gu<JASS_MAX_ARRAY_SIZE then
set Gu=Gu+1
set Wt=Gu
set gu[Wt]=953
else
call Ni("Out of memory: Could not create LLIterator.","when calling error in LinkedList, line 461")
set Wt=0
endif
else
set Yu=Yu-1
set Wt=Tu[Yu]
set gu[Wt]=953
endif
set er=er-1
set Et=Wt
set qr[er]="when calling construct_LLIterator in LinkedList, line 467"
set er=er+1
set Qt=Et
set Sr[Qt]=true
set Zt=vt!=0
if not Zt then
call tl("Assertion failed")
endif
set ir[Et]=vt
set qr[er]="when calling reset in LinkedList, line 470"
set er=er+1
if gu[Et]==0 then
if Et==0 then
call Ni("Nullpointer exception when calling LLIterator.reset","when calling error in LinkedList, line 478")
else
call Ni("Called LLIterator.reset on invalid object.","when calling error in LinkedList, line 478")
endif
endif
set qr[er]="when calling reset in LinkedList, line 478"
set er=er+1
set Qt=ir[Et]
set qr[er]="when calling getDummy in LinkedList, line 479"
set er=er+1
if ju[Qt]==0 then
if Qt==0 then
call Ni("Nullpointer exception when calling LinkedList.getDummy","when calling error in LinkedList, line 407")
else
call Ni("Called LinkedList.getDummy on invalid object.","when calling error in LinkedList, line 407")
endif
endif
set Qt=cr[Qt]
set er=er-1
set sr[Et]=Qt
set tr[Et]=sr[Et]
set er=er-1-1-1-1-1
return Wt
endfunction
function qs takes integer ps,string es returns nothing
set qr[er]=es
set er=er+1
if Sr[ps]then
set qr[er]="when calling dispatch_LLIterator_destroyLLIterator in LinkedList, line 524"
set er=er+1
if gu[ps]==0 then
if ps==0 then
call Ni("Nullpointer exception when calling LLIterator.LLIterator","when calling error in LinkedList, line 461")
else
call Ni("Called LLIterator.LLIterator on invalid object.","when calling error in LinkedList, line 461")
endif
endif
set qr[er]="when calling destroyLLIterator in LinkedList, line 461"
set er=er+1
set qr[er]="when calling dealloc_LLIterator in LinkedList, line 461"
set er=er+1
if gu[ps]==0 then
call Ni("Double free: object of type LLIterator","when calling error in LinkedList, line 461")
else
set Tu[Yu]=ps
set Yu=Yu+1
set gu[ps]=0
endif
set er=er-1-1-1
endif
set er=er-1
endfunction
function Ai takes string vi returns nothing
local string mi
local boolean Qi
local integer Wi
local integer Ei
local string Zi
local string Ui
local string Ii
local string Pi
set qr[er]=vi
set er=er+1
if (not T)or Y then
set er=er-1
return
endif
set Y=true
if Z==0 then
set Pi="PASS"
else
set Pi="FAIL"
endif
set qr[er]="when calling resultPayload in E2E, line 180"
set er=er+1
set mi="{"
set Qi=true
set Wi=Ut(f,"when calling iterator in E2E, line 209")
loop
set Ei=Wi
exitwhen rr[tr[Ei]]==sr[Ei]
set Ei=Wi
set tr[Ei]=rr[tr[Ei]]
set Ei=wr[tr[Ei]]
if Qi then
set Zi=""
else
set Zi=","
endif
set Ui=Zi
set Zi=Hu[Ei]
set mi=mi+Ui+"\""+Zi+"\""+":"+I2S(Ju[Ei])
set Qi=false
endloop
call qs(Wi,"when calling close in E2E, line 209")
set mi=mi+"}"
set Zi="{"
set Qi=true
set Wi=Ut(R,"when calling iterator in E2E, line 215")
loop
set Ei=Wi
exitwhen rr[tr[Ei]]==sr[Ei]
set Ei=Wi
set tr[Ei]=rr[tr[Ei]]
set Ei=wr[tr[Ei]]
if Qi then
set Ui=""
else
set Ui=","
endif
set Ii=Ui
set Ui=Ku[Ei]
set Zi=Zi+Ii+"\""+Ui+"\""+":"+R2S(Lu[Ei])
set Qi=false
endloop
call qs(Wi,"when calling close in E2E, line 215")
set Zi=Zi+"}"
set Ii="{"+"\""+"asserts"+"\""+":"+I2S(E+Z)+","
set Ii=Ii+"\""+"failed"+"\""+":"+I2S(Z)+","
set Ii=Ii+"\""+"failedIds"+"\""+":"
set Ui=U
set Ii=Ii+"\""+Ui+"\""+","
set Ii=Ii+"\""+"eventKindsDropped"+"\""+":"+I2S(Q)+","
set Ii=Ii+"\""+"metricsDropped"+"\""+":"+I2S(W)+","
set Ui="metrics"
set Ui=Ii+"\""+Ui+"\""+":"+Zi+","
set mi=Ui+"\""+"events"+"\""+":"+mi+"}"
set er=er-1
call US(Pi,mi,"when calling emit in E2E, line 180")
set er=er-1
endfunction
function Dc takes string Uc,boolean Ic returns nothing
local string Pc
local string Ac
if (not T)or Y then
return
endif
if Ic then
set E=E+1
else
set Z=Z+1
if I<q then
set Ac=U
if I>0 then
set Pc=","
else
set Pc=""
endif
set U=Ac+Pc+Uc
set I=I+1
endif
endif
endfunction
function Fs takes string Rs,string Ts returns nothing
local integer Ys
local integer Gs
local integer gs
local integer hs
set qr[er]=Ts
set er=er+1
if (not T)or Y then
set er=er-1
return
endif
set hs=Ut(f,"when calling iterator in E2E, line 146")
loop
set Ys=hs
exitwhen rr[tr[Ys]]==sr[Ys]
set Ys=hs
set tr[Ys]=rr[tr[Ys]]
set Ys=wr[tr[Ys]]
if Hu[Ys]==Rs then
set Ju[Ys]=Ju[Ys]+1
call qs(hs,"when calling close in E2E, line 146")
set er=er-1
return
endif
endloop
call qs(hs,"when calling close in E2E, line 146")
set hs=f
set qr[er]="when calling size in E2E, line 150"
set er=er+1
if ju[hs]==0 then
if hs==0 then
call Ni("Nullpointer exception when calling LinkedList.size","when calling error in LinkedList, line 151")
else
call Ni("Called LinkedList.size on invalid object.","when calling error in LinkedList, line 151")
endif
endif
set hs=lr[hs]
set er=er-1
if hs<a then
set hs=f
set qr[er]="when calling new_EventCounter in E2E, line 151"
set er=er+1
set qr[er]="when calling alloc_EventCounter in E2E, line 51"
set er=er+1
if Nw==0 then
if Mw<JASS_MAX_ARRAY_SIZE then
set Mw=Mw+1
set Ys=Mw
else
call Ni("Out of memory: Could not create EventCounter.","when calling error in E2E, line 47")
set Ys=0
endif
else
set Nw=Nw-1
set Ys=Bw[Nw]
endif
set er=er-1
set Gs=Ys
set gs=Gs
set Ju[gs]=1
set Hu[Gs]=Rs
set er=er-1
call xi(hs,"when calling add in E2E, line 151",Ys)
else
set Q=Q+1
endif
set er=er-1
endfunction
function Zc takes nothing returns integer
set K=K+1
return K
endfunction
function cS takes nothing returns integer
set L=L+"i"
return 5
endfunction
function mc takes nothing returns integer
set L=L+"v"
return 7
endfunction
function vc takes string fc returns nothing
local integer Rc
local string Tc
local real Yc
local integer Gc
local integer gc
local boolean hc
local integer Fc
local integer kc
local integer jc
local integer xc
set qr[er]=fc
set er=er+1
set J[K]=Zc()
set Rc=J[0]
set qr[er]="when calling recordMetric in EvalOrderProbe, line 32"
set er=er+1
set Tc="arr0"
set Yc=Rc*1.
set hc=false
set qr[er]="when calling recordMetric in E2E, line 173"
set er=er+1
if (not T)or Y then
set er=er-1
set hc=true
endif
if not hc then
set Gc=Ut(R,"when calling iterator in E2E, line 163")
endif
if not hc then
loop
exitwhen hc
if not hc then
set Rc=Gc
exitwhen rr[tr[Rc]]==sr[Rc]
endif
if not hc then
set gc=Gc
set tr[gc]=rr[tr[gc]]
set gc=wr[tr[gc]]
endif
if not hc then
if Ku[gc]==Tc then
if not hc then
set Lu[gc]=Yc
endif
if not hc then
call qs(Gc,"when calling close in E2E, line 163")
endif
if not hc then
set er=er-1
endif
if not hc then
set hc=true
endif
endif
endif
endloop
endif
if not hc then
call qs(Gc,"when calling close in E2E, line 163")
endif
if not hc then
set Gc=R
set qr[er]="when calling size in E2E, line 167"
set er=er+1
if ju[Gc]==0 then
if Gc==0 then
call Ni("Nullpointer exception when calling LinkedList.size","when calling error in LinkedList, line 151")
else
call Ni("Called LinkedList.size on invalid object.","when calling error in LinkedList, line 151")
endif
endif
set Gc=lr[Gc]
set er=er-1
if Gc<n then
if not hc then
set Gc=R
set qr[er]="when calling new_Metric in E2E, line 168"
set er=er+1
set qr[er]="when calling alloc_Metric in E2E, line 62"
set er=er+1
if uu==0 then
if ru<JASS_MAX_ARRAY_SIZE then
set ru=ru+1
set gc=ru
else
call Ni("Out of memory: Could not create Metric.","when calling error in E2E, line 58")
set gc=0
endif
else
set uu=uu-1
set gc=wu[uu]
endif
set er=er-1
set Rc=gc
set Ku[Rc]=Tc
set Lu[Rc]=Yc
set er=er-1
call xi(Gc,"when calling add in E2E, line 168",gc)
endif
elseif not hc then
set W=W+1
endif
endif
if not hc then
set er=er-1
endif
set er=er-1
set Gc=J[1]
set qr[er]="when calling recordMetric in EvalOrderProbe, line 33"
set er=er+1
set Tc="arr1"
set Yc=Gc*1.
set hc=false
set qr[er]="when calling recordMetric in E2E, line 173"
set er=er+1
if (not T)or Y then
set er=er-1
set hc=true
endif
if not hc then
set Fc=Ut(R,"when calling iterator in E2E, line 163")
endif
if not hc then
loop
exitwhen hc
if not hc then
set Gc=Fc
exitwhen rr[tr[Gc]]==sr[Gc]
endif
if not hc then
set kc=Fc
set tr[kc]=rr[tr[kc]]
set kc=wr[tr[kc]]
endif
if not hc then
if Ku[kc]==Tc then
if not hc then
set Lu[kc]=Yc
endif
if not hc then
call qs(Fc,"when calling close in E2E, line 163")
endif
if not hc then
set er=er-1
endif
if not hc then
set hc=true
endif
endif
endif
endloop
endif
if not hc then
call qs(Fc,"when calling close in E2E, line 163")
endif
if not hc then
set Fc=R
set qr[er]="when calling size in E2E, line 167"
set er=er+1
if ju[Fc]==0 then
if Fc==0 then
call Ni("Nullpointer exception when calling LinkedList.size","when calling error in LinkedList, line 151")
else
call Ni("Called LinkedList.size on invalid object.","when calling error in LinkedList, line 151")
endif
endif
set Fc=lr[Fc]
set er=er-1
if Fc<n then
if not hc then
set Fc=R
set qr[er]="when calling new_Metric in E2E, line 168"
set er=er+1
set qr[er]="when calling alloc_Metric in E2E, line 62"
set er=er+1
if uu==0 then
if ru<JASS_MAX_ARRAY_SIZE then
set ru=ru+1
set kc=ru
else
call Ni("Out of memory: Could not create Metric.","when calling error in E2E, line 58")
set kc=0
endif
else
set uu=uu-1
set kc=wu[uu]
endif
set er=er-1
set Gc=kc
set Ku[Gc]=Tc
set Lu[Gc]=Yc
set er=er-1
call xi(Fc,"when calling add in E2E, line 168",kc)
endif
elseif not hc then
set W=W+1
endif
endif
if not hc then
set er=er-1
endif
set er=er-1
if J[0]==1 then
call Fs("set-array-index-read-first","when calling recordEvent in EvalOrderProbe, line 35")
elseif J[1]==1 then
call Fs("set-array-rhs-first","when calling recordEvent in EvalOrderProbe, line 37")
else
call Fs("set-array-unexpected","when calling recordEvent in EvalOrderProbe, line 39")
endif
set J[cS()]=mc()
call Fs("set-array-call-order-"+L,"when calling recordEvent in EvalOrderProbe, line 43")
set Fc=J[5]
set qr[er]="when calling recordMetric in EvalOrderProbe, line 44"
set er=er+1
set Tc="arr5"
set Yc=Fc*1.
set hc=false
set qr[er]="when calling recordMetric in E2E, line 173"
set er=er+1
if (not T)or Y then
set er=er-1
set hc=true
endif
if not hc then
set jc=Ut(R,"when calling iterator in E2E, line 163")
endif
if not hc then
loop
exitwhen hc
if not hc then
set Fc=jc
exitwhen rr[tr[Fc]]==sr[Fc]
endif
if not hc then
set xc=jc
set tr[xc]=rr[tr[xc]]
set xc=wr[tr[xc]]
endif
if not hc then
if Ku[xc]==Tc then
if not hc then
set Lu[xc]=Yc
endif
if not hc then
call qs(jc,"when calling close in E2E, line 163")
endif
if not hc then
set er=er-1
endif
if not hc then
set hc=true
endif
endif
endif
endloop
endif
if not hc then
call qs(jc,"when calling close in E2E, line 163")
endif
if not hc then
set jc=R
set qr[er]="when calling size in E2E, line 167"
set er=er+1
if ju[jc]==0 then
if jc==0 then
call Ni("Nullpointer exception when calling LinkedList.size","when calling error in LinkedList, line 151")
else
call Ni("Called LinkedList.size on invalid object.","when calling error in LinkedList, line 151")
endif
endif
set jc=lr[jc]
set er=er-1
if jc<n then
if not hc then
set jc=R
set qr[er]="when calling new_Metric in E2E, line 168"
set er=er+1
set qr[er]="when calling alloc_Metric in E2E, line 62"
set er=er+1
if uu==0 then
if ru<JASS_MAX_ARRAY_SIZE then
set ru=ru+1
set xc=ru
else
call Ni("Out of memory: Could not create Metric.","when calling error in E2E, line 58")
set xc=0
endif
else
set uu=uu-1
set xc=wu[uu]
endif
set er=er-1
set Fc=xc
set Ku[Fc]=Tc
set Lu[Fc]=Yc
set er=er-1
call xi(jc,"when calling add in E2E, line 168",xc)
endif
elseif not hc then
set W=W+1
endif
endif
if not hc then
set er=er-1
endif
set er=er-1
call Dc("probe-ran",true)
set qr[er]="when calling alloc_CallbackSingle_doAfter_EvalOrderProbe in EvalOrderProbe, line 47"
set er=er+1
if Ew==0 then
if Zw<JASS_MAX_ARRAY_SIZE then
set Zw=Zw+1
set jc=Zw
set Uw[jc]=879
else
call Ni("Out of memory: Could not create CallbackSingle_doAfter_EvalOrderProbe.","when calling error in EvalOrderProbe, line 47")
set jc=0
endif
else
set Ew=Ew-1
set jc=Ww[Ew]
set Uw[jc]=879
endif
set er=er-1
call Es(3.,jc,"when calling doAfter in EvalOrderProbe, line 47")
set er=er-1
endfunction
function wt takes nothing returns nothing
local timer Zs
local integer Us
local integer Is
local timerdialog Ps
local string As
local integer Ds
local integer Hs
local integer Js
local integer Ks
local real Ls
local code Xs
local timer Cs
local timer Vs
local boolean Bs
local boolean Ns
local string Ms
set qr[er]="via function reference ClosureTimers, line 134"
set er=er+1
set qr[er]="when calling staticCallback in ClosureTimers, line 134"
set er=er+1
set Zs=GetExpiredTimer()
set Us=et(Zs,"when calling getData in ClosureTimers, line 139")
set Is=Us
set qr[er]="when calling call in ClosureTimers, line 140"
set er=er+1
if Uw[Is]==0 then
if Is==0 then
call Ni("Nullpointer exception when calling CallbackSingle.call","when calling error in ClosureTimers, line 129")
else
call Ni("Called CallbackSingle.call on invalid object.","when calling error in ClosureTimers, line 129")
endif
endif
if Uw[Is]<=880 then
if Uw[Is]<=878 then
if Uw[Is]<=877 then
set Ds=Is
set qr[er]="when calling call_doAfter_ClosureTimers in ClosureTimers, line 129"
set er=er+1
set Hs=Iu[Ds]
set qr[er]="when calling dispatch_Callback_destroyCallback in ClosureTimers, line 43"
set er=er+1
if Kw[Hs]==0 then
if Hs==0 then
call Ni("Nullpointer exception when calling Callback.Callback","when calling error in ClosureTimers, line 124")
else
call Ni("Called Callback.Callback on invalid object.","when calling error in ClosureTimers, line 124")
endif
endif
set qr[er]="when calling destroyCallback in ClosureTimers, line 124"
set er=er+1
set qr[er]="when calling dealloc_Callback in ClosureTimers, line 124"
set er=er+1
if Kw[Hs]==0 then
call Ni("Double free: object of type Callback","when calling error in ClosureTimers, line 124")
else
set Jw=Jw+1
set Kw[Hs]=0
endif
set er=er-1-1-1
set Ps=Pu[Ds]
call DestroyTimerDialog(Ps)
set er=er-1
else
set qr[er]="when calling call_doAfter_E2E_E2E in ClosureTimers, line 129"
set er=er+1
set Ms="{"+"\""+"canReadFiles"+"\""+":"
set Bs=C
if Bs then
set As="true"
else
set As="false"
endif
call US("READY",Ms+As+"}","when calling emit in E2E, line 122")
set qr[er]="when calling alloc_CallbackSingle_doAfter_doAfter_E2E_E2E in E2E, line 127"
set er=er+1
if Ew==0 then
if Zw<JASS_MAX_ARRAY_SIZE then
set Zw=Zw+1
set Ds=Zw
set Uw[Ds]=880
else
call Ni("Out of memory: Could not create CallbackSingle_doAfter_doAfter_E2E_E2E.","when calling error in E2E, line 127")
set Ds=0
endif
else
set Ew=Ew-1
set Ds=Ww[Ew]
set Uw[Ds]=880
endif
set er=er-1
call Es(1.,Ds,"when calling doAfter in E2E, line 127")
set er=er-1
endif
elseif Uw[Is]<=879 then
set qr[er]="when calling call_doAfter_EvalOrderProbe in ClosureTimers, line 129"
set er=er+1
call Ai("when calling finish in EvalOrderProbe, line 48")
set er=er-1
else
set qr[er]="when calling call_doAfter_doAfter_E2E_E2E in ClosureTimers, line 129"
set er=er+1
call US("LOADED","{"+"\""+"mapLoaded"+"\""+":true}","when calling emit in E2E, line 128")
set Ns=false
set qr[er]="when calling startSuite in E2E, line 129"
set er=er+1
set Ds=0
set Hs=Ut(d,"when calling iterator in E2E, line 188")
loop
exitwhen Ns
if not Ns then
set Is=Hs
exitwhen rr[tr[Is]]==sr[Is]
endif
if not Ns then
set Js=Hs
set tr[Js]=rr[tr[Js]]
set Js=wr[tr[Js]]
endif
if not Ns then
if Xu[Js]==j then
if not Ns then
set Ds=Js
endif
endif
endif
endloop
if not Ns then
call qs(Hs,"when calling close in E2E, line 188")
endif
if not Ns then
if Ds==0 then
if not Ns then
set Y=true
endif
if not Ns then
set Ms="{"+"\""+"error"+"\""+":"
call US("FAIL",Ms+"\""+"unknown-suite"+"\""+"}","when calling emit in E2E, line 193")
endif
if not Ns then
set er=er-1
endif
if not Ns then
set Ns=true
endif
endif
endif
if not Ns then
call US("RUNNING","{}","when calling emit in E2E, line 195")
endif
if not Ns then
set Ls=e
endif
if not Ns then
set qr[er]="when calling alloc_CallbackPeriodic_doPeriodically_E2E_E2E in E2E, line 196"
set er=er+1
if Xw==0 then
if Cw<JASS_MAX_ARRAY_SIZE then
set Cw=Cw+1
set Hs=Cw
set Vw[Hs]=875
else
call Ni("Out of memory: Could not create CallbackPeriodic_doPeriodically_E2E_E2E.","when calling error in E2E, line 196")
set Hs=0
endif
else
set Xw=Xw-1
set Hs=Lw[Xw]
set Vw[Hs]=875
endif
set er=er-1
set Ks=Hs
endif
if not Ns then
set Hs=Ks
set qr[er]="when calling doPeriodically in E2E, line 196"
set er=er+1
set qr[er]="when calling getTimer in ClosureTimers, line 74"
set er=er+1
if Tw>0 then
set Tw=Tw-1
call KS(Rw[Tw],0,"when calling setData in TimerUtils, line 30")
set er=er-1
set Cs=Rw[Tw]
set Bs=true
else
set Cs=CreateTimer()
call KS(Cs,0,"when calling setData in TimerUtils, line 33")
set Vs=Cs
set er=er-1
set Cs=Vs
set Bs=true
endif
set Cs=Cs
set qr[er]="when calling doPeriodically in ClosureTimers, line 74"
set er=er+1
set qr[er]="when calling start in ClosureTimers, line 62"
set er=er+1
if Vw[Hs]==0 then
if Hs==0 then
call Ni("Nullpointer exception when calling CallbackPeriodic.start","when calling error in ClosureTimers, line 156")
else
call Ni("Called CallbackPeriodic.start on invalid object.","when calling error in ClosureTimers, line 156")
endif
endif
set qr[er]="when calling start in ClosureTimers, line 156"
set er=er+1
call KS(Cs,Hs,"when calling setData in ClosureTimers, line 158")
set Vs=Cs
set Xs=ls
call TimerStart(Vs,Ls,true,Xs)
set Au[Hs]=Cs
set er=er-1-1-1-1
endif
if not Ns then
set Ds=Cu[Ds]
set qr[er]="when calling run in E2E, line 204"
set er=er+1
if Qw[Ds]==0 then
if Ds==0 then
call Ni("Nullpointer exception when calling E2ESuiteBody.run","when calling error in E2E, line 37")
else
call Ni("Called E2ESuiteBody.run on invalid object.","when calling error in E2E, line 37")
endif
endif
if Qw[Ds]<=894 then
if Qw[Ds]<=893 then
if Qw[Ds]<=892 then
set qr[er]="when calling run_register_CanaryAdapter in E2E, line 37"
set er=er+1
call Dc("boots",true)
call Fs("canary-event","when calling recordEvent in CanaryAdapter, line 20")
call Fs("canary-event","when calling recordEvent in CanaryAdapter, line 21")
set qr[er]="when calling alloc_CallbackSingle_doAfter_register_CanaryAdapter in CanaryAdapter, line 22"
set er=er+1
if Ew==0 then
if Zw<JASS_MAX_ARRAY_SIZE then
set Zw=Zw+1
set Ds=Zw
set Uw[Ds]=881
else
call Ni("Out of memory: Could not create CallbackSingle_doAfter_register_CanaryAdapter.","when calling error in CanaryAdapter, line 22")
set Ds=0
endif
else
set Ew=Ew-1
set Ds=Ww[Ew]
set Uw[Ds]=881
endif
set er=er-1
call Es(5.,Ds,"when calling doAfter in CanaryAdapter, line 22")
set er=er-1
else
set qr[er]="when calling run_register_CanaryAdapter in E2E, line 37"
set er=er+1
call Dc("boots",true)
set qr[er]="when calling alloc_CallbackSingle_doAfter_register_CanaryAdapter in CanaryAdapter, line 28"
set er=er+1
if Ew==0 then
if Zw<JASS_MAX_ARRAY_SIZE then
set Zw=Zw+1
set Ds=Zw
set Uw[Ds]=882
else
call Ni("Out of memory: Could not create CallbackSingle_doAfter_register_CanaryAdapter.","when calling error in CanaryAdapter, line 28")
set Ds=0
endif
else
set Ew=Ew-1
set Ds=Ww[Ew]
set Uw[Ds]=882
endif
set er=er-1
call Es(3.,Ds,"when calling doAfter in CanaryAdapter, line 28")
set er=er-1
endif
else
set qr[er]="when calling run_register_CanaryAdapter in E2E, line 37"
set er=er+1
call Dc("boots",true)
set qr[er]="when calling alloc_CallbackSingle_doAfter_register_CanaryAdapter in CanaryAdapter, line 34"
set er=er+1
if Ew==0 then
if Zw<JASS_MAX_ARRAY_SIZE then
set Zw=Zw+1
set Ds=Zw
set Uw[Ds]=883
else
call Ni("Out of memory: Could not create CallbackSingle_doAfter_register_CanaryAdapter.","when calling error in CanaryAdapter, line 34")
set Ds=0
endif
else
set Ew=Ew-1
set Ds=Ww[Ew]
set Uw[Ds]=883
endif
set er=er-1
call Es(4.,Ds,"when calling doAfter in CanaryAdapter, line 34")
set er=er-1
endif
elseif Qw[Ds]<=896 then
if Qw[Ds]<=895 then
set qr[er]="when calling run_register_CanaryAdapter in E2E, line 37"
set er=er+1
call Dc("boots",true)
set qr[er]="when calling alloc_CallbackSingle_doAfter_register_CanaryAdapter in CanaryAdapter, line 39"
set er=er+1
if Ew==0 then
if Zw<JASS_MAX_ARRAY_SIZE then
set Zw=Zw+1
set Ds=Zw
set Uw[Ds]=884
else
call Ni("Out of memory: Could not create CallbackSingle_doAfter_register_CanaryAdapter.","when calling error in CanaryAdapter, line 39")
set Ds=0
endif
else
set Ew=Ew-1
set Ds=Ww[Ew]
set Uw[Ds]=884
endif
set er=er-1
call Es(20.,Ds,"when calling doAfter in CanaryAdapter, line 39")
set er=er-1
else
set qr[er]="when calling run_register_CanaryAdapter in E2E, line 37"
set er=er+1
call Ai("when calling finish in CanaryAdapter, line 43")
set er=er-1
endif
else
set qr[er]="when calling run_register_CanaryAdapter in E2E, line 37"
set er=er+1
call vc("when calling runEvalOrderProbe in CanaryAdapter, line 46")
set er=er-1
endif
set er=er-1
endif
if not Ns then
set er=er-1
endif
set er=er-1
endif
elseif Uw[Is]<=882 then
if Uw[Is]<=881 then
set qr[er]="when calling call_doAfter_register_CanaryAdapter in ClosureTimers, line 129"
set er=er+1
call Dc("waited",true)
call Ai("when calling finish in CanaryAdapter, line 24")
set er=er-1
else
set qr[er]="when calling call_doAfter_register_CanaryAdapter in ClosureTimers, line 129"
set er=er+1
call Dc("deliberate-failure",false)
call Ai("when calling finish in CanaryAdapter, line 30")
set er=er-1
endif
elseif Uw[Is]<=883 then
set G=true
else
set qr[er]="when calling call_doAfter_register_CanaryAdapter in ClosureTimers, line 129"
set er=er+1
call Ai("when calling finish in CanaryAdapter, line 40")
set er=er-1
endif
set er=er-1
set qr[er]="when calling dispatch_CallbackSingle_destroyCallbackSingle in ClosureTimers, line 141"
set er=er+1
if Uw[Us]==0 then
if Us==0 then
call Ni("Nullpointer exception when calling CallbackSingle.CallbackSingle","when calling error in ClosureTimers, line 127")
else
call Ni("Called CallbackSingle.CallbackSingle on invalid object.","when calling error in ClosureTimers, line 127")
endif
endif
set qr[er]="when calling destroyCallbackSingle in ClosureTimers, line 127"
set er=er+1
set Ds=Us
set qr[er]="when calling CallbackSingle_onDestroy in ClosureTimers, line 146"
set er=er+1
set Cs=Du[Ds]
set Bs=false
set qr[er]="when calling release in ClosureTimers, line 147"
set er=er+1
if Cs==null then
call Ni("Trying to release a null timer","when calling error in TimerUtils, line 38")
set er=er-1
set Bs=true
endif
if not Bs then
if et(Cs,"when calling getData in TimerUtils, line 40")==Gw then
if not Bs then
call Ni("ReleaseTimer: Double free!","when calling error in TimerUtils, line 41")
endif
if not Bs then
set er=er-1
endif
if not Bs then
set Bs=true
endif
endif
endif
if not Bs then
call KS(Cs,Gw,"when calling setData in TimerUtils, line 43")
endif
if not Bs then
set Vs=Cs
call PauseTimer(Vs)
endif
if not Bs then
set Rw[Tw]=Cs
endif
if not Bs then
set Tw=Tw+1
endif
if not Bs then
set er=er-1
endif
set er=er-1
set qr[er]="when calling dealloc_CallbackSingle in ClosureTimers, line 146"
set er=er+1
if Uw[Us]==0 then
call Ni("Double free: object of type CallbackSingle","when calling error in ClosureTimers, line 127")
else
set Ww[Ew]=Us
set Ew=Ew+1
set Uw[Us]=0
endif
set er=er-1-1-1-1-1
set Zs=null
set Ps=null
set Cs=null
set Vs=null
endfunction
function xt takes nothing returns boolean
set N=kw
set M=jw
return true
endfunction
function ol takes nothing returns nothing
set fr=function Vc
set Yr=function Wo
set Gr=function SS
set hr=function pS
set Fr=function Uo
set kr=function nS
set jr=function cl
set xr=function XO
set vr=function as
set Wr=function dS
set Ur=function ro
set Pr=function Sl
set Hr=function Do
set Jr=function xt
set Kr=function Zo
set Lr=function Pt
set Xr=function nO
set Nr=function Hc
set Mr=function ul
set us=function gS
set ss=function RO
set ts=function ll
set is=function dO
set Ss=function tS
set cs=function co
set os=function wt
set Os=function ns
set ls=function ct
endfunction
function main takes nothing returns nothing
local trigger Ft
local real kt
local player jt
call ol()
call ExecuteFunc("Mo")
call SetCameraBounds((-3328.0)+GetCameraMargin(CAMERA_MARGIN_LEFT),(-3584.0)+GetCameraMargin(CAMERA_MARGIN_BOTTOM),3328.0-GetCameraMargin(CAMERA_MARGIN_RIGHT),3072.0-GetCameraMargin(CAMERA_MARGIN_TOP),(-3328.0)+GetCameraMargin(CAMERA_MARGIN_LEFT),3072.0-GetCameraMargin(CAMERA_MARGIN_TOP),3328.0-GetCameraMargin(CAMERA_MARGIN_RIGHT),(-3584.0)+GetCameraMargin(CAMERA_MARGIN_BOTTOM))
call SetDayNightModels("Environment\\DNC\\DNCLordaeron\\DNCLordaeronTerrain\\DNCLordaeronTerrain.mdl","Environment\\DNC\\DNCLordaeron\\DNCLordaeronUnit\\DNCLordaeronUnit.mdl")
call NewSoundEnvironment("Default")
if bj_dayAmbientSound!=null then
call StopSound(bj_dayAmbientSound,true,true)
endif
set bj_dayAmbientSound=CreateMIDISound("LordaeronSummerDay",20,20)
set kt=GetFloatGameState(GAME_STATE_TIME_OF_DAY)
if kt>=bj_TOD_DAWN and kt<bj_TOD_DUSK then
call StartSound(bj_dayAmbientSound)
endif
if bj_nightAmbientSound!=null then
call StopSound(bj_nightAmbientSound,true,true)
endif
set bj_nightAmbientSound=CreateMIDISound("LordaeronSummerNight",20,20)
set kt=GetFloatGameState(GAME_STATE_TIME_OF_DAY)
if kt<bj_TOD_DAWN or kt>=bj_TOD_DUSK then
call StartSound(bj_nightAmbientSound)
endif
call SetMapMusic("Music",true,0)
set jt=Player(0)
call CreateUnit(jt,1214409837,-126.6,102.2,228.600)
call InitBlizzard()
set Ft=CreateTrigger()
call TriggerAddCondition(Ft,Condition(fr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package BitSet.","when calling error in BitSet, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(Yr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package String.","when calling error in String, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(Gr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package Vectors.","when calling error in Vectors, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(hr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package Player.","when calling error in Player, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(Fr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package Printing.","when calling error in Printing, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(kr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package MagicFunctions.","when calling error in MagicFunctions, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(jr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package Basics.","when calling error in Basics, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(xr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package GameTimer.","when calling error in GameTimer, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(vr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package ErrorHandling.","when calling error in ErrorHandling, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(Wr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package Table.","when calling error in Table, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(Ur))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package Colors.","when calling error in Colors, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(Pr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package Group.","when calling error in Group, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(Hr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package TypeCasting.","when calling error in TypeCasting, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(Jr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package HashList.","when calling error in HashList, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(Kr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package EventHelper.","when calling error in EventHelper, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(Lr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package ClosureForGroups.","when calling error in ClosureForGroups, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(Xr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package LinkedList.","when calling error in LinkedList, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(Nr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package ChunkedString.","when calling error in ChunkedString, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(Mr))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package SafetyChecks.","when calling error in SafetyChecks, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(us))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package FileIO.","when calling error in FileIO, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(ss))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package TimerUtils.","when calling error in TimerUtils, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(ts))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package E2E.","when calling error in E2E, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(is))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package EvalOrderProbe.","when calling error in EvalOrderProbe, line 1")
endif
call TriggerClearConditions(Ft)
call TriggerAddCondition(Ft,Condition(Ss))
if not TriggerEvaluate(Ft) then
call Ni("Could not initialize package CanaryAdapter.","when calling error in CanaryAdapter, line 1")
endif
call TriggerClearConditions(Ft)
call DestroyTrigger(Ft)
set Ft=null
set jt=null
call probeWriteFile("probe-b.txt","STAGE0_REACHED_MAIN")
call ExecuteFunc("probeControlThread")
call ExecuteFunc("probeValidUtf8Thread")
call ExecuteFunc("probeLoneHighThread")
call ExecuteFunc("probeScrambledThread")
call ExecuteFunc("probeMixedThread")
call ExecuteFunc("probeRoundTripThread")
call probeWriteFile("probe-b.txt","STAGE_ALL_DISPATCHED")

endfunction
function config takes nothing returns nothing
call SetMapName("wc3-e2e-canary")
call SetMapDescription("")
call SetPlayers(1)
call SetTeams(1)
call SetGamePlacement(MAP_PLACEMENT_TEAMS_TOGETHER)
call DefineStartLocation(0,-128.0,64.0)
call SetPlayerStartLocation(Player(0),0)
call SetPlayerColor(Player(0),ConvertPlayerColor(0))
call SetPlayerRacePreference(Player(0),RACE_PREF_HUMAN)
call SetPlayerRaceSelectable(Player(0),true)
call SetPlayerController(Player(0),MAP_CONTROL_USER)
call SetPlayerTeam(Player(0),0)
call SetStartLocPrioCount(0,0)
call SetEnemyStartLocPrioCount(0,0)
endfunction

