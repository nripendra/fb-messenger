#pragma option -v+

#define MyAppName "Fb-messenger"
#define MyAppVer '1.0.0.0'

[Setup]
AppName={#MyAppName}
AppVersion={#MyAppVer}
DefaultDirName={pf}\{#MyAppName}
OutputBaseFilename=fb-messenger-setup
OutputDir=./installer
UninstallFilesDir={code:GetAppDir}

[Dirs]
Name: "{code:GetAppDir}\{#MyAppVer}"

[Files]
Source: "./unzipper.dll"; Flags: dontcopy
Source: "./electron/build/v0.34.3/win32-ia32/fb-messenger.zip"; DestDir: "{code:GetAppDir}"; Flags: deleteafterinstall;  AfterInstall: ExtractMe('{code:GetAppDir}\fb-messenger.zip', '{code:GetAppDir}\{#MyAppVer}');

[UninstallDelete]
Type: filesandordirs; Name: "{code:GetAppDir}"

[Code]
procedure unzip(src, target: AnsiString);
external 'unzip@files:unzipper.dll stdcall delayload';


procedure ExtractMe(src, target : AnsiString);
begin
  unzip(ExpandConstant(src), ExpandConstant(target));
end;

function GetAppDir(src: AnsiString): AnsiString;
var
  PathTail: string;
begin
  PathTail := ExtractFileName(RemoveBackslashUnlessRoot(ExpandConstant('{app}')));
  if PathTail = '{#MyAppName}' then
  begin
    Result := ExpandConstant('{app}');
  end
  else
  begin
    Result := ExpandConstant('{app}\{#MyAppName}');
  end;
end;