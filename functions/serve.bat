@echo off
call npx kill-port 9000 8085 -y
call npm run build
pushd ..
call firebase emulators:start --project ssrtest-cebd9
popd