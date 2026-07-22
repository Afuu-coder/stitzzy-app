# Stitzzy — Firebase Secrets Setup (Non-interactive)
# Uses --non-interactive flag to skip prompts

$project = "stitzzy"
$backend = "stitzzy-app"
$location = "us-central1"

$secrets = @{
    "NEXT_PUBLIC_FIREBASE_API_KEY"             = "AIzaSyDAAWGbCjN7yAiFvJ_mHmgrT-0G1vaesEw"
    "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN"         = "stitzzy.firebaseapp.com"
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID"          = "stitzzy"
    "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET"      = "stitzzy.firebasestorage.app"
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID" = "753115900011"
    "NEXT_PUBLIC_FIREBASE_APP_ID"              = "1:753115900011:web:18f21239f990857682e92e"
    "FIREBASE_ADMIN_PROJECT_ID"                = "stitzzy"
    "FIREBASE_ADMIN_CLIENT_EMAIL"              = "firebase-adminsdk-fbsvc@stitzzy.iam.gserviceaccount.com"
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY"        = "pk_test_YWJzb2x1dGUtbWluay05MC5jbGVyay5hY2NvdW50cy5kZXYk"
    "CLERK_SECRET_KEY"                         = "sk_test_cYCXjTgvviNQgddsHGAtKzEYy771Ud0xDAMfCmjCFx"
}

foreach ($name in $secrets.Keys) {
    Write-Host "Setting $name..." -ForegroundColor Cyan
    $val = $secrets[$name]
    # Use gcloud to directly set the secret version — bypasses Firebase CLI prompts
    $encoded = [System.Convert]::ToBase64String([System.Text.Encoding]::UTF8.GetBytes($val))
    $val | gcloud secrets versions add $name --data-file=- --project=$project 2>&1
    if ($LASTEXITCODE -ne 0) {
        # Secret might not exist yet — create it first
        $val | gcloud secrets create $name --data-file=- --project=$project --replication-policy=automatic 2>&1
    }
    Write-Host "  Done: $name" -ForegroundColor Green
}

# FIREBASE_ADMIN_PRIVATE_KEY needs special handling (multiline)
Write-Host "Setting FIREBASE_ADMIN_PRIVATE_KEY..." -ForegroundColor Cyan
$pk = "-----BEGIN PRIVATE KEY-----`nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCxztImWojoMjYi`nlJj46XiH2NvQSqRHwXPhLsr0NA5BwIWl349w6v1P5VoRu3RNvwdRWxIrtBC+Enw8`nhjnDbqPXCapRYd/IXjPZ2z/THe7cjLuftmJShFCSyIQOuobV1fb//KoWNjpQSwvY`nzw1V2PTetKEHTcX3pd69ol5QrGHloODRMiMxq16Hmzv30xFBTec7Zsu82e1YMgLR`nMFTG8IRFokyP+M7+j9e5sZ7cSxIjVq/rfGCYRT1pXPZjEwUlZMUO+ndSqrvwX9I9`nd6khz0RVx+np6MGv4mBcVMWLk2VqVzl3mryBKGRGdh6n9fuUWfnYGkDFbIH4C3kb`nRHWR9pz9AgMBAAECggEAEsQJ/GfGNsFj4sLtoSmc4bOCwYk7LOKPLRcv7tWWopxj`nzpWZcTiv2vCRELmIxRLR/iVfNdMXiEPxrj6ZVpW0/4NC4Ttz75T3onjIE+s/FDJb`nM/g/CMfzrAYzH83SYLuoCazcM6NuBJ7jBXMWzHZtI5sLOrbb2677IucBzsBexaoH`nkdcpH+m1nJSURMiAFeIjUqyWOGXinjZw3X5h2ODQ18hHEBWP/ilkKquu7+mZ+2K8`nkh9cyqv7u62SjEbaAHEM8xXH7lsBEqLYoIDzmnjp6dAUy3/KLhjpYgbyX9G+40c/`nZdINfv8EVmhDuqcJacxXoHwIIUBeyQa8e0tZhT8hGQKBgQDpKSFDXcy4F6xcy75/`nHHuW9/hphTNEu8rTEwJ646V8uPZKKsPH63mdPt6GyvtViUxmYCNkG1/BBxuZ6r7C`nn6pFqgbEEGQQWhVQdVnABRDg9llX78RQqmv6YHEk8QMJT3/mgUVBjFkjVC8UYbmv`nku8RH65aXi4DFpHjX4C6oHyDNQKBgQDDOaIeT0qCouQZBGTamS2AoqDctTV+vOpj`nxj0M3vdIVa1uR6+NO7rYCS+eeMHphAm3GDm5Ud6Ykkj6LDysU+P0ZGp/ZC5bNhBa`nHF7vnrDYnf2wqn/fPJ/47ngyEWm4pGiBO8T+aRJhYXAlTh5QqBcECpczCNrzmcX+`nu/cSezzjqQKBgBIXQ+JzO7go9hG5KU25iwlasiaV1DWIEKOx/OZGFYgI3etBSDGR`n3rzJrQBubXPklE35NaXFzfcvMwANS8HUG6UOHTpHP0xZgP/eKxmQCxA5bRM6olPT`n9U7W/tBr9t1ZEsZyz0nXtu7b0E9Xic3Kq8v7Vk7isdVBgg5PUbCpVR/lAoGAXD5B`nIb0pYayBxmhTFw7Fd0BgbaiZjDbLMTWb5xb7FIyXE8J/amZMlINSorhAN4wR4xdp`nPu02FjUYkkyQpoRE81b3ExZM6QAUnd9F5EbBHLkaA32sSdilZcOXu2CK6ZmVX2rU`nW7ld2/FkQdw1arrhlSFD6/NFMVD5QrGhvnPIg3ECgYA2smFmWAF/TwHpJe/zf/VR`nMG+GUNIv9agwVJbcMix2o4HKuTFy66Zx6YT7IakWg1s6EfFaw5l2jnCWQ0QDaT9A`ntp2ER3JjPXBC3j64BcBMa24HusxoXpJ0rE15qcumkMJTopG/kluB2RnJe7s4XK2h`nYR5VRHBAOl0ZROd4tc6kDw==`n-----END PRIVATE KEY-----`n"
$pk | gcloud secrets versions add FIREBASE_ADMIN_PRIVATE_KEY --data-file=- --project=$project 2>&1
if ($LASTEXITCODE -ne 0) {
    $pk | gcloud secrets create FIREBASE_ADMIN_PRIVATE_KEY --data-file=- --project=$project --replication-policy=automatic 2>&1
}
Write-Host "  Done: FIREBASE_ADMIN_PRIVATE_KEY" -ForegroundColor Green

# Grant App Hosting backend service account access to all secrets
Write-Host "`nGranting backend access to all secrets..." -ForegroundColor Yellow
$allSecrets = @(
    "NEXT_PUBLIC_FIREBASE_API_KEY", "NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN",
    "NEXT_PUBLIC_FIREBASE_PROJECT_ID", "NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET",
    "NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID", "NEXT_PUBLIC_FIREBASE_APP_ID",
    "FIREBASE_ADMIN_PROJECT_ID", "FIREBASE_ADMIN_CLIENT_EMAIL", "FIREBASE_ADMIN_PRIVATE_KEY",
    "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY", "CLERK_SECRET_KEY"
)
foreach ($s in $allSecrets) {
    Write-Host "  Granting: $s" -ForegroundColor Cyan
    firebase apphosting:secrets:grantaccess $s --project $project --backend $backend --location $location 2>&1
}

Write-Host "`nAll done!" -ForegroundColor Green
Write-Host "Live URL: https://stitzzy-app--stitzzy.us-central1.hosted.app" -ForegroundColor Yellow
