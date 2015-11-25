;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;
;;                                                                                                             ;;
;;  This is a template for setup script. To generate actual script the following variables needs to be         ;;
;;  replaced with actual values:                                                                               ;;
;;  - {{appname}}                                                                                              ;;
;;  - {{appver}}                                                                                               ;;
;;  - {{outputfilename}}                                                                                       ;;
;;  - {{PackageFiles}}                                                                                         ;;
;;  - {{OutputDir}}                                                                                            ;;
;;                                                                                                             ;;
;;  This script is built with intension of support google chrome like silent automatic updates. But it         ;;
;;  alone cannot fulfill all the requirements. This needs to be done in coordination with the installed        ;;
;;  application. This script sets-up an infrastructure through which application can make itself update        ;;
;;  automatically without manual intervention.                                                                 ;;
;;                                                                                                             ;;
;;  This script does following:                                                                                ;;
;;    1. Register the application to launch on windows start.                                                  ;;
;;    2. Creates a scheduled task named named "exec-{{appname}}-setup" to execute installer from               ;;
;;      "%AppData%/{{appname}}" folder                                                                         ;;
;;        - The installer is run in verysilent mode hence without showing any UI, supressing any               ;;
;;          messageboxes and supressing system restart.                                                        ;;
;;        - This task is set to run with highest priviledge, hence no UAC would be shown                       ;;
;;    3. Installs files in desired location. The folder structure will be as follows                           ;;
;;        ->{userselectedfolder}/{{appname}} (appname is appended automatically if not mentioned by user)      ;;
;;          ->{{appver}}                                                                                       ;;
;;             -> All application related files (exe, dlls etc)                                                ;;
;;          ->{{uninstaller}}                                                                                  ;;
;;          ->{{shortcut}}                                                                                     ;;
;;      hence, it allows newer version of application to be installed side by side without affecting           ;;
;;      the running application. If newer version is installed then then shortcuts and registry entries are    ;;
;;      updated to point to the newer version, thus when running the application next time, latest             ;;
;;      version is executed.                                                                                   ;;
;;    4. Delete all the old version folders if executible from that folder isn't running currently.            ;;
;;        - This allows to silently install side by side without having to stop program, while also.           ;;
;;          cleanning up the installed folder as version progresses.                                           ;;
;;                                                                                                             ;;
;;  The application is supposed to handle following steps to enable proper silent update:                      ;;
;;    1. Check for update and download installer in background.                                                ;;
;;    2. Save the installer file in "%AppData%/{{appname}}" location.                                          ;;
;;    3. Rename installer to "{{appname}}-setup.exe" if name is different.                                     ;;
;;    4. Start the scheduled task, named "exec-{{appname}}-setup".                                             ;;
;;    5. Inform user to restart the application. It is an optional step, but in past I have faced              ;;
;;       scenarios where user go on without shutting down their machine as well as application for             ;;
;;       months, hence the newer version of application never gets chance. So informing does help. Although    ;;
;;       one might argue that it is not completely silent :)                                                   ;;
;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;;


#pragma option -v+

#define MyAppName "{{appname}}"
#define MyAppVer "{{appver}}"
#define OutputBaseFilename "{{outputfilename}}"
#define PackageFiles "{{PackageFiles}}"
#define OutputDir "{{OutputDir}}"

[Setup]
AppName={#MyAppName}
AppVersion={#MyAppVer}
DefaultDirName={pf}\{#MyAppName}
OutputBaseFilename={#OutputBaseFilename}
OutputDir={#OutputDir}
UninstallFilesDir={code:GetAppDir}
PrivilegesRequired=admin
DisableDirPage=auto
DirExistsWarning=no
AppId=7E4831F5-26DB-41DD-AC9C-D0501E894397
DefaultGroupName={#MyAppName}
DisableProgramGroupPage=yes

[Registry]
;Autostart program on windows start
Root: HKLM; Subkey: "SOFTWARE\Microsoft\Windows\CurrentVersion\Run"; ValueType: string; ValueName: "{#MyAppName}"; ValueData: """{code:GetAppDir}\{#MyAppVer}\{#MyAppName}.exe"""; Flags: uninsdeletevalue

[Files]
;scheduler needs to be configured using xml because, by default a taks created using schtasks sets 'Start the task only if the computer is on AC power' to true,
;and there dosen't seem to be a way to modify that flag through command only...
source: "./scheduler.xml"; DestDir: {tmp}; DestName: {#MyAppName}-{#MyAppVer}-scheduler.xml; AfterInstall: SetSchedulerValues
;restart script
source: "./restart.bat";  DestDir: "{code:GetAppDir}"; DestName: restart.bat;
;All files to be packaged into application
Source: "{#PackageFiles}"; DestDir: "{code:GetAppDir}\{#MyAppVer}"; Flags: recursesubdirs; Excludes: "*.tmp"

[UninstallRun]
;Kill all instances of application before uninstall.
Filename: "{cmd}"; Parameters: "/C ""taskkill /im {#MyAppName}.exe /f /t"

[UninstallDelete]
;Files to delete on uninstall
Type: filesandordirs; Name: "{code:GetAppDir}"

[Icons]
;Shortcut icon in installed folder, outside the version folder
Name: "{app}\{#MyAppName}"; Filename: "{code:GetAppDir}\{#MyAppVer}\{#MyAppName}.exe"; WorkingDir: "{code:GetAppDir}\{#MyAppVer}"
;Shortcut icon in desktop.
Name: "{commondesktop}\{#MyAppName}"; Filename: "{code:GetAppDir}\{#MyAppVer}\{#MyAppName}.exe"; WorkingDir: "{code:GetAppDir}\{#MyAppVer}"

[Run]
;schedule a task to run installer (to support auto update scenario)
Filename: "{sys}\schtasks.exe"; Parameters: "/create /tn ""exec-{#MyAppName}-setup"" /f /XML ""{tmp}\{#MyAppName}-{#MyAppVer}-scheduler.xml"""
;auto run application after completing installtion
Filename: {code:GetAppDir}\{#MyAppVer}\{#MyAppName}.exe; Description: Run Application; Flags: postinstall nowait skipifsilent

[UninstallRun]
;Remove scheduled task on uninstall
Filename: "{sys}\schtasks.exe"; Parameters: "/delete /tn ""exec-{#OutputBaseFilename}"" /f"

[Code]
///////////////////////////////////////////////////////////////////////
//                                                                   //
//                         Helper FUNCTIONS                          //
//                                                                   //
///////////////////////////////////////////////////////////////////////

//Append trailing application name even if not entered by user.
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

//Check if specified application is running given full executible path
function IsAppRunning(ExecPath : string): Boolean;
var
    FSWbemLocator: Variant;
    FWMIService   : Variant;
    FWbemObjectSet: Variant;
    query: string;
    fn: string;
begin
    Result := false;
    FSWbemLocator := CreateOleObject('WbemScripting.SWbemLocator');
    FWMIService := FSWbemLocator.ConnectServer('localhost', 'root\CIMV2');
    StringChangeEx(ExecPath, '\', '\\', True);
    query := Format('SELECT ExecutablePath FROM Win32_Process Where ExecutablePath="%s"',[ExecPath]);
    FWbemObjectSet := FWMIService.ExecQuery(query);
    Result := (FWbemObjectSet.Count > 0);
    FWbemObjectSet := Unassigned;
    FWMIService := Unassigned;
    FSWbemLocator := Unassigned;
end;

//Autoupdate support: Delete all previous version folders if application from that folder isn't running.
procedure DelPreviousVersionsIfNotRunning(const Directory: string);
var
  FindRec: TFindRec;
  path: string;
  execPath: string;
begin
  if FindFirst(Directory + '\*', FindRec) then
  try
    repeat
      if (FindRec.Attributes and FILE_ATTRIBUTE_DIRECTORY <> 0) then
      begin
        if (FindRec.Name <> '.') And (FindRec.Name <> '..') And (FindRec.Name <> '{#MyAppVer}')  then
        begin
          path := GetAppDir('') + '\' + FindRec.Name;
          execPath := path + '\{#MyAppName}.exe';
          if not (IsAppRunning(execPath)) then
          begin
            DelTree(path, True, True, True);
          end;
        end
      end;
    until
      not FindNext(FindRec);
  finally
    FindClose(FindRec);
  end;
end;

//http://stackoverflow.com/questions/9602070/how-to-modify-the-exe-config-from-innosetup-script
procedure SetSchedulerValues();
var
  XMLDoc, 
  RootNode,
  AuthorNode, 
  CommandNode: Variant;
  FileName,
  ReplaceString: string;
begin
  FileName := ExpandConstant('{tmp}\{#MyAppName}-{#MyAppVer}-scheduler.xml');
  ReplaceString :=  '"%AppData%/{#MyAppName}/{#MyAppName}-setup.exe"';

  try
      XMLDoc := CreateOleObject('MSXML2.DOMDocument');
  except
    RaiseException('MSXML is required to complete the installation process.'#13#13'(Error ''' + GetExceptionMessage + ''' occurred)');
  end;

  XMLDoc.async := False;
  XMLDoc.resolveExternals := False;
  XMLDoc.load(FileName);
  if XMLDoc.parseError.errorCode <> 0 then
    RaiseException('Error on line ' + IntToStr(XMLDoc.parseError.line) + ', position ' + IntToStr(XMLDoc.parseError.linepos) + ': ' + XMLDoc.parseError.reason);
  
  RootNode := XMLDoc.documentElement;
  AuthorNode := RootNode.selectSingleNode('//RegistrationInfo/Author');
  AuthorNode.text := '{#MyAppName}';

  CommandNode := RootNode.selectSingleNode('//Actions/Exec/Command');
  CommandNode.text := ReplaceString;

  XMLDoc.Save(FileName);
end;

///////////////////////////////////////////////////////////////////////
//                                                                   //
//                    INNO SETUP EVENT FUNCTIONS                     //
//                                                                   //
///////////////////////////////////////////////////////////////////////

//Change textbox value for selected dir, appending default application name if not already entered by user.
function NextButtonClick(CurPageID: Integer): Boolean;
begin
  if CurPageID = wpSelectDir then
    WizardForm.DirEdit.Text := GetAppDir('');
  Result := True;
end;

procedure CurStepChanged(CurStep: TSetupStep);
var  
  AppDir: AnsiString;
begin
  if CurStep = ssDone then begin
    AppDir := GetAppDir('');
    //Call DelPreviousVersionsIfNotRunning only after successful installation.
    DelPreviousVersionsIfNotRunning(AppDir) ;
  end;
end; 