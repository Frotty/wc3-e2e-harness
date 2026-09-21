import de.peeeq.wurstio.mpq.MpqEditor;
import de.peeeq.wurstio.mpq.MpqEditorFactory;

import java.io.File;
import java.nio.file.Files;
import java.util.Optional;

/** Replaces war3map.j inside a .w3x with a raw JASS file, bypassing the compiler entirely. */
public class InjectScript {
    public static void main(String[] args) throws Exception {
        File map = new File(args[0]);
        File script = new File(args[1]);
        try (MpqEditor ed = MpqEditorFactory.getEditor(Optional.of(map), false)) {
            ed.deleteFile("war3map.j");
            ed.insertFile("war3map.j", Files.readAllBytes(script.toPath()));
        }
        System.out.println("injected " + script.getName() + " into " + map.getName());
    }
}
