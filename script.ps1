$targetFolder = "C:\Users\vierhec\Desktop\DHBW\Web Enigneering\Webshop\DHBW-WebShop\images\animals\cats"  # <--- Pfad anpassen

# Name des aktuellen Ordners (z. B. "dogs")
$folderName = Split-Path -Path $targetFolder -Leaf

# Bildformate, die berücksichtigt werden
$extensions = @("*.jpg", "*.jpeg", "*.png", "*.bmp", "*.gif", "*.tiff")

# Alle passenden Dateien im Ordner holen
$images = Get-ChildItem -Path $targetFolder -Include $extensions -File

# Bilder nummeriert umbenennen
$counter = 1
foreach ($img in $images) {
    $ext = $img.Extension.ToLower()
    $newName = "{0}_{1:D3}{2}" -f $folderName, $counter, $ext
    $newPath = Join-Path -Path $targetFolder -ChildPath $newName

    Rename-Item -Path $img.FullName -NewName $newPath
    $counter++
}

