local M={}
function M.profile(mode,frame_ms)
  local drive=mode=='drive'
  local pressure=math.max(0,math.min(1,(frame_ms-16.7)/24))
  return {exposure=(drive and 2.18 or 1.94)-pressure*0.10, smoke=drive and 0.10 or 0.42, trees=drive and 80 or 0, fail_open=true}
end
local function encode(v)
  if type(v)=='boolean' then return tostring(v) end
  if type(v)=='number' then return string.format('%.4f',v):gsub('0+$',''):gsub('%.$','') end
  if type(v)=='string' then return string.format('%q',v) end
  local keys={} for k in pairs(v) do keys[#keys+1]=k end table.sort(keys)
  local out={} for _,k in ipairs(keys) do out[#out+1]=string.format('%q:%s',k,encode(v[k])) end
  return '{'..table.concat(out,',')..'}'
end
if arg and arg[1] then local f=assert(io.open(arg[1],'w'));f:write(encode({abi=1,garage=M.profile('garage',16.7),drive=M.profile('drive',16.7)}),'\n');f:close() end
return M
