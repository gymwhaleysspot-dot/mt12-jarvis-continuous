#!/usr/bin/env python3
from pathlib import Path
import re

ROOT=Path('.github/workflows')

def text(name):
    p=ROOT/name
    assert p.is_file(), f'missing workflow: {name}'
    return p.read_text()

def trigger_block(src):
    m=re.search(r'^on:\s*\n(?P<body>(?:^[ \t].*\n?)*)',src,re.M)
    return m.group('body') if m else ''

def require_manual_only(name):
    src=text(name); block=trigger_block(src)
    assert re.search(r'^\s+workflow_dispatch:',block,re.M), f'{name}: workflow_dispatch missing'
    assert not re.search(r'^\s+(schedule|push|pull_request|workflow_run):',block,re.M), f'{name}: automatic trigger restored'

producer='jarvis-complete-rewrite-factory.yml'
require_manual_only(producer)
p=text(producer)
assert 'gh workflow run jarvis-complete-rewrite-factory.yml' not in p, 'rewrite factory self-dispatch restored'
assert 'HARD_FAIL_AND_REPLAN' in p and 'historically published' in p, 'historical dedup gate missing'

for wf in (
    'jarvis-complete-factory.yml',
    'guaranteed-luac.yml',
    'workbench.yml',
    'controller-release-publisher.yml',
    'controller-tournament.yml',
    'engineering-mission.yml',
    'jarvis-mission-scheduler.yml',
):
    require_manual_only(wf)

a=text('jarvis-always-on.yml')
assert "primary='jarvis-complete-rewrite-factory.yml'" in a
for forbidden in ('jarvis-complete-factory.yml','guaranteed-luac.yml','workbench.yml','controller-tournament.yml','engineering-mission.yml'):
    assert forbidden not in a, f'Always-On dispatches forbidden producer: {forbidden}'

pm=Path('tools/jarvis_persistent_mission.py').read_text()
pm_code='\n'.join(line.split('#',1)[0] for line in pm.splitlines())
for forbidden in ('jarvis-complete-factory.yml','jarvis-complete-rewrite-factory.yml','guaranteed-luac.yml','workbench.yml','controller-tournament.yml','jarvis-evolution-gate.yml'):
    assert forbidden not in pm_code, f'persistent mission dispatches controller path: {forbidden}'

g=text('jarvis-mandatory-intelligence-gate.yml')
assert 'Jarvis Complete Rewrite LUAC Factory' in g
assert 'gh workflow run jarvis-persistent-mission.yml' not in g
assert not re.search(r'^\s+schedule:',trigger_block(g),re.M)

ps=text('jarvis-persistent-mission.yml')
assert 'Jarvis Mandatory Controller Intelligence Gate' in ps
assert not re.search(r'^\s+schedule:',trigger_block(ps),re.M)

print('Jarvis workflow wiring: PASS — one autonomous producer, no self-requeue, secondary publishers explicit-only.')
