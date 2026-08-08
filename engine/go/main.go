package main
import("encoding/json";"os";"runtime")
type Build struct{ABI int `json:"abi"`;Language string `json:"language"`;Compiler string `json:"compiler"`;Purpose string `json:"purpose"`;FailOpen bool `json:"failOpen"`}
func main(){out:="jarvis/generated/go-build.json";if len(os.Args)>1{out=os.Args[1]};f,e:=os.Create(out);if e!=nil{panic(e)};defer f.Close();e=json.NewEncoder(f).Encode(Build{1,"go",runtime.Version(),"reproducible toolchain inventory",true});if e!=nil{panic(e)}}
