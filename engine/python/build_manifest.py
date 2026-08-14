#!/usr/bin/env python3
import hashlib, json, pathlib, sys
root=pathlib.Path(sys.argv[1] if len(sys.argv)>1 else 'jarvis/generated')
spec=json.loads(pathlib.Path('engine/polyglot.json').read_text())
artifacts=[]
for path in sorted(root.glob('*')):
    if path.is_file():
        data=path.read_bytes(); artifacts.append({'name':path.name,'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()})
names={a['name'] for a in artifacts}; missing=[name for name in spec['requiredArtifacts'] if name not in names and name!='polyglot-manifest.json']
if missing: raise SystemExit(f'missing required artifacts: {missing}')
output={'engine':spec['engine'],'abi':spec['abi'],'languages':spec['languages'],'artifacts':artifacts,'failOpen':True}
root.mkdir(parents=True,exist_ok=True); (root/'polyglot-manifest.json').write_text(json.dumps(output,indent=2)+'\n')
