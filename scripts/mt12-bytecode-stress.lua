local p=assert(arg[1],'bytecode path required')
local rounds=tonumber(arg[2]) or 12
local before=collectgarbage('count')
local peak=before
local last
for i=1,rounds do
  collectgarbage('collect')
  local f,e=loadfile(p,'b')
  assert(f,e)
  local ok,r=pcall(f)
  assert(ok,r)
  if type(r)=='table' then
    assert(type(r.run)=='function','EdgeTX script missing run function')
    if r.init then assert(type(r.init)=='function','init must be function') end
    if r.background then assert(type(r.background)=='function','background must be function') end
  end
  last=r
  local k=collectgarbage('count')
  if k>peak then peak=k end
end
collectgarbage('collect')
local after=collectgarbage('count')
print(string.format('{"rounds":%d,"beforeKB":%.3f,"peakKB":%.3f,"afterKB":%.3f,"growthKB":%.3f,"returned":"%s"}',rounds,before,peak,after,after-before,type(last)))
