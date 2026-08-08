using System.Text.Json;
var output=args.Length>0?args[0]:"jarvis/generated/capability-schema.json";
var schema=new {abi=1,language="csharp",engine="MICHAEL_V55",capabilities=new[]{"hdr-linear","energy-conserving-clearcoat","aces-tonemap","mobile-safe-camera","production-camera-framing","single-owner-adaptive-quality","bounded-mobile-shadows","polyglot-wasm","fail-open"},required=new[]{"webgl2","wasm"}};
Directory.CreateDirectory(Path.GetDirectoryName(output)??".");
File.WriteAllText(output,JsonSerializer.Serialize(schema,new JsonSerializerOptions{WriteIndented=true})+Environment.NewLine);
