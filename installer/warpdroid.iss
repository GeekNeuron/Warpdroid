[Setup]
AppId={{B7E1F5A0-6C2E-4B1A-9F3D-2E8C1A9B7D4E}}
AppName=Warpdroid
AppVersion=0.1.0
AppPublisher=Warpdroid Contributors
AppPublisherURL=https://github.com/your-username/warpdroid
DefaultDirName={autopf}\Warpdroid
DefaultGroupName=Warpdroid
DisableProgramGroupPage=yes
OutputDir=output
OutputBaseFilename=warpdroid-setup
Compression=lzma
SolidCompression=yes
ArchitecturesAllowed=x64
ArchitecturesInstallIn64BitMode=x64
PrivilegesRequired=lowest
ChangesEnvironment=yes
UninstallDisplayIcon={app}\warpdroid.exe

[Files]
Source: "..\dist\warpdroid.exe"; DestDir: "{app}"; Flags: ignoreversion

[Icons]
Name: "{group}\Warpdroid"; Filename: "{app}\warpdroid.exe"
Name: "{group}\Uninstall Warpdroid"; Filename: "{uninstallexe}"

[Registry]
Root: HKCU; Subkey: "Environment"; ValueType: expandsz; ValueName: "Path"; ValueData: "{olddata};{app}"; Check: NeedsAddPath('{app}')

[Code]
function NeedsAddPath(Param: string): boolean;
var
  OrigPath: string;
begin
  if not RegQueryStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', OrigPath) then
  begin
    Result := True;
    exit;
  end;
  Result := Pos(';' + ExpandConstant(Param) + ';', ';' + OrigPath + ';') = 0;
end;

procedure CurUninstallStepChanged(CurUninstallStep: TUninstallStep);
var
  Path: string;
  P: Integer;
  AppDir: string;
begin
  if CurUninstallStep = usPostUninstall then
  begin
    AppDir := ExpandConstant('{app}');
    if RegQueryStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', Path) then
    begin
      P := Pos(';' + AppDir + ';', ';' + Path + ';');
      if P > 0 then
      begin
        Delete(Path, P, Length(AppDir) + 1);
        RegWriteStringValue(HKEY_CURRENT_USER, 'Environment', 'Path', Path);
      end;
    end;
  end;
end;
