Param()

# 現在のディレクトリを取得する
$startdir = Get-Location
$cd = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $cd

$script:saintCoinach = ".\SaintCoinachData"
$script:distribution = ".\docs"
$script:dataDir = Join-Path $script:distribution "data"
$script:jsonDir = Join-Path $script:dataDir "json";
$script:effectsJsonFile = Join-Path $script:jsonDir "effects.json";

function CopyIcon($icon) {
    if ($icon -and $icon.EndsWith(".png")) {
        $srcIcon = Join-Path $script:saintCoinach (Join-Path "ui/" $icon)
        $dstIcon = Join-Path $script:dataDir $icon
        if (!(Test-Path $dstIcon)) {
            $dstIcon
            if (Test-Path $srcIcon) {
                Copy-Item -Path $srcIcon -Destination $dstIcon -Force
            }
        }
    }
}

if (Test-Path $script:dataDir) {
    Remove-Item -Path $script:dataDir -Recurse -Force | Out-Null
}
New-Item -Path $script:dataDir -ItemType Directory -Force | Out-Null
New-Item -Path $script:jsonDir -ItemType Directory -Force | Out-Null

$status = @()
Get-Content (Join-Path $script:saintCoinach "exd\Status.csv") `
| ConvertFrom-Csv `
| Select-Object "key", "0", "1", "2", "3" `
| ForEach-Object {

    [int]$id = $null;
    if ([int]::TryParse($_.key, [ref]$id)) {

        $name = $_.0;
        $description = $_.1
        $tex = $_.2;
        #$stack = [int]$_.3
        $stack = 0

        $icon = $tex -replace "^ui/", "" -replace ".tex$", ".png"
        if ($icon) {
            $iconDir = Split-Path -Parent $icon
        }
        $iconFileName = [System.IO.Path]::GetFileNameWithoutExtension($icon);
        $iconFileNumber = [int]$iconFileName;


        # 先にアイコンのディレクトリだけ作る
        if ($icon -and $icon.EndsWith(".png")) {
            $dstDir = Split-Path -Parent (Join-Path $script:dataDir $icon);
            if (!(Test-Path $dstDir)) {
                New-Item $dstDir -Force -ItemType Directory | Out-Null
            }
        }

        $stackIcons = @();
        #if ($icon -and $stack -gt 0) {
        #    for ($i = 0; $i -lt $stack; $i++) {
        #        $stackIconFileName = "{0:000000}" -f ($iconFileNumber + $i) + ".png"
        #        $stackIcon = (Join-Path $iconDir $stackIconFileName).Replace("\", "/");
        #        $stackIcons += New-Object PSObject -Property @{
        #            stack = ($i + 1); 
        #            icon  = $stackIcon;
        #        }
        #    }
        #}

        $statusEntry = @{ 
            id          = $id;
            name        = $name;
            description = $description;
            icon        = $icon;
            stack       = $stack;
            stackIcons  = $stackIcons;
        }
        $status += New-Object PSObject -Property $statusEntry
    }
}

Start-Sleep -Milliseconds 1000;

$status `
| ForEach-Object {
    $icon = $_.icon
    $stackIcons = $_.stackIcons
    CopyIcon($icon)

    if ($stackIcons) {
        $stackIcons | ForEach-Object {
            $icon = $_.icon
            CopyIcon($icon)
        }
    }
    

}

$status | ConvertTo-Json -Depth 100 | Out-File -Encoding UTF8 $script:effectsJsonFile

Set-Location $startdir