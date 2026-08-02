-- A17Y MT12 runtime certificate logger; deploy as /SCRIPTS/TOOLS/mt12cert.lua
local f,started,last,peak,low,frames,slow=nil,0,0,0,1e9,0,0
local function now() return getTime and getTime() or 0 end
local function mem() local ok,v=pcall(collectgarbage,'count');return ok and v or -1 end
local function write(s) if f then io.write(f,s) end end
local function openlog()
  if f then return end
  f=io.open('/LOGS/mt12cert.csv','w')
  if f then write('tick,phase,heap_kb,delta_ticks,frames,slow_frames\n') end
end
local function sample(phase)
  openlog();local t=now();local m=mem();local d=last>0 and t-last or 0;last=t;frames=frames+1
  if m>peak then peak=m end;if m>=0 and m<low then low=m end;if d>2 then slow=slow+1 end
  write(string.format('%d,%s,%.2f,%d,%d,%d\n',t,phase,m,d,frames,slow))
end
local function init() started=now();sample('INIT') end
local function run(event)
  local t=now();local phase='IDLE';if t-started<100 then phase='STARTUP' elseif t-started<300 then phase='MEMORY_LOAD' else phase='STEADY' end
  if t-last>=10 then sample(phase) end
  lcd.clear();lcd.drawText(2,2,'A17Y MT12 CERT',MIDSIZE);lcd.drawText(2,24,'Heap KB '..string.format('%.1f',mem()),0);lcd.drawText(2,40,'Peak '..string.format('%.1f',peak)..' Low '..string.format('%.1f',low),0);lcd.drawText(2,56,'Slow frames '..slow,0)
  if event==EVT_EXIT_BREAK or event==EVT_RTN_BREAK then if f then write(string.format('%d,FINAL,%.2f,0,%d,%d\n',t,mem(),frames,slow));io.close(f);f=nil end return 2 end
  return 0
end
return{init=init,run=run}
