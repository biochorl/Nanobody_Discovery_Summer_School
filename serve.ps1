$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")
$listener.Start()
Write-Host "Server started at http://localhost:$port/"
try {
    while($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        $path = $request.Url.LocalPath
        if ($path -eq "/") { $path = "/index.html" }
        # Resolve the real path and refuse anything outside this folder (e.g. /..%2f..%2fsecret)
        $root = (Get-Location).Path.TrimEnd('\') + '\'
        $file = [System.IO.Path]::GetFullPath((Join-Path $root $path.TrimStart('/')))
        if ($file.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase) -and (Test-Path -LiteralPath $file -PathType Leaf)) {
            $extension = [System.IO.Path]::GetExtension($file)
            $contentType = switch ($extension) {
                ".html" { "text/html" }
                ".css"  { "text/css" }
                ".js"   { "application/javascript" }
                ".png"  { "image/png" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".gif"  { "image/gif" }
                ".svg"  { "image/svg+xml" }
                ".pdf"  { "application/pdf" }
                default { "application/octet-stream" }
            }
            $response.ContentType = $contentType
            [byte[]]$buffer = [System.IO.File]::ReadAllBytes($file)
            $response.ContentLength64 = $buffer.Length
            $response.OutputStream.Write($buffer, 0, $buffer.Length)
            $response.OutputStream.Close()
        } else {
            $response.StatusCode = 404
            $response.Close()
        }
    }
} finally {
    $listener.Stop()
}
