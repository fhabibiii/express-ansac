# ANSAC API - Dokumentasi Autentikasi, User & Blog

Dokumentasi ini menjelaskan tentang sistem autentikasi, manajemen user, dan blog pada API ANSAC dengan fitur refresh token dan penggunaan UUID.

## Tabel Konten

- [Autentikasi](#autentikasi)
  - [Register](#register)
  - [Login](#login)
  - [Refresh Token](#refresh-token)
- [Manajemen User](#manajemen-user)
  - [Get User Profile](#get-user-profile)
  - [Update User Profile](#update-user-profile)
  - [Delete User Account](#delete-user-account)
  - [Check Password](#check-password)
  - [Change Password](#change-password)
- [Manajemen Blog](#manajemen-blog)
  - [Get Public Blogs](#get-public-blogs)
  - [Create Blog](#create-blog)
  - [Get All Blogs](#get-all-blogs)
  - [Get All Pending Blogs](#get-all-pending-blogs)
  - [Get User Blogs](#get-user-blogs)
  - [Get Blog By ID](#get-blog-by-id)
  - [Update Blog](#update-blog)
  - [Delete Blog](#delete-blog)
  - [Change Blog Status](#change-blog-status)
  - [Upload Blog Image](#upload-blog-image)
- [Sistem Token](#sistem-token)
  - [Access Token](#access-token)
  - [Refresh Token](#refresh-token-1)
  - [Keamanan UUID](#keamanan-uuid)

## Autentikasi

### Register

**Endpoint:** `POST /auth/register`

**Deskripsi:** Mendaftarkan pengguna baru ke dalam sistem.

**Request Body:**
```json
{
  "username": "testuser",
  "name": "Test User",
  "email": "testuser@example.com",
  "password": "password123",
  "phoneNumber": "1234567890",
  "dateOfBirth": "2000-01-01",
  "role": "USER_SELF",
  "address": "123 Test Street, Test City, 12345"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Register successfully, please login with your credentials",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000", // UUID
    "username": "testuser",
    "name": "Test User",
    "email": "testuser@example.com",
    "phoneNumber": "1234567890",
    "dateOfBirth": "2000-01-01T00:00:00.000Z",
    "role": "USER_SELF",
    "address": "123 Test Street, Test City, 12345",
    "createdAt": "2025-05-05T12:00:00.000Z"
  }
}
```

**Logika:**
- Memeriksa ketersediaan username, email, dan phoneNumber
- Mengenkripsi password menggunakan bcrypt
- Menyimpan data pengguna baru ke database dengan UUID yang digenerate otomatis
- Mengembalikan data pengguna tanpa password dan menggunakan UUID sebagai ID publik

### Login

**Endpoint:** `POST /auth/login`

**Deskripsi:** Melakukan login dan mendapatkan access token dan refresh token.

**Request Body:**
```json
{
  "username": "testuser",
  "password": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Login successful",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5...",
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000", // UUID
      "username": "testuser",
      "name": "Test User",
      "email": "testuser@example.com",
      "role": "USER_SELF",
      "dateOfBirth": "2000-01-01T00:00:00.000Z",
      "address": "123 Test Street, Test City, 12345"
    }
  }
}
```

**Logika:**
- Memvalidasi username dan password
- Membuat access token (durasi pendek) dan refresh token (durasi panjang)
- Access token berisi ID internal dan UUID pengguna
- Refresh token berisi ID internal, UUID, dan tipe token
- Mengembalikan data pengguna dengan UUID sebagai ID publik

### Refresh Token

**Endpoint:** `POST /auth/refresh-token`

**Deskripsi:** Mendapatkan access token baru menggunakan refresh token tanpa perlu login ulang.

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5..."
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Token refreshed successfully",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5..."
  }
}
```

**Logika:**
- Memverifikasi validitas refresh token
- Memeriksa apakah token tersebut memang bertipe "refresh"
- Menemukan user berdasarkan ID yang ada di dalam token
- Men-generate access token baru tanpa memerlukan kredensial login
- Access token baru memiliki durasi yang sama dengan token asli

## Manajemen User

### Get User Profile

**Endpoint:** `GET /user/:id`

**Deskripsi:** Mendapatkan informasi profil pengguna berdasarkan UUID.

**Headers:**
- Authorization: Bearer {accessToken}

**Response:**
```json
{
  "status": "success",
  "message": "Account retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000", // UUID
    "username": "testuser",
    "name": "Test User",
    "email": "testuser@example.com",
    "phoneNumber": "1234567890",
    "dateOfBirth": "2000-01-01T00:00:00.000Z",
    "role": "USER_SELF",
    "address": "123 Test Street, Test City, 12345",
    "createdAt": "2025-05-05T12:00:00.000Z"
  }
}
```

**Logika:**
- Menggunakan middleware autentikasi untuk memvalidasi token
- Memverifikasi bahwa UUID di URL cocok dengan ID pengguna dalam token
- Mencari pengguna berdasarkan UUID dalam database
- Mengembalikan data pengguna dengan UUID sebagai ID publik

### Update User Profile

**Endpoint:** `PUT /user/:id`

**Deskripsi:** Memperbarui informasi profil pengguna.

**Headers:**
- Authorization: Bearer {accessToken}

**Request Body:**
```json
{
  "name": "Updated Name",
  "phoneNumber": "9876543210",
  "dateOfBirth": "1995-05-05",
  "address": "456 New Street, Updated City, 54321",
  "username": "updated_username",
  "email": "updated@example.com",
  "role": "USER_PARENT"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Account updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000", // UUID
    "username": "updated_username",
    "name": "Updated Name",
    "email": "updated@example.com",
    "phoneNumber": "9876543210",
    "dateOfBirth": "1995-05-05T00:00:00.000Z",
    "role": "USER_PARENT",
    "address": "456 New Street, Updated City, 54321",
    "createdAt": "2025-05-05T12:00:00.000Z"
  }
}
```

**Logika:**
- Memverifikasi UUID pengguna dan autentikasi
- Mencari pengguna berdasarkan UUID
- Memvalidasi username agar tidak duplikat (jika diubah)
- Memvalidasi email agar tidak duplikat (jika diubah)
- Memvalidasi role agar hanya dapat berupa USER_SELF atau USER_PARENT
- Memperbarui hanya field yang diberikan, mempertahankan nilai lama untuk field yang tidak disediakan
- Mengembalikan data pengguna yang diperbarui dengan UUID sebagai ID publik

### Delete User Account

**Endpoint:** `DELETE /user/:id`

**Deskripsi:** Menghapus akun pengguna.

**Headers:**
- Authorization: Bearer {accessToken}

**Response:**
```json
{
  "status": "success",
  "message": "Account deleted successfully",
  "data": null
}
```

**Logika:**
- Memverifikasi UUID pengguna dan autentikasi
- Mencari pengguna berdasarkan UUID
- Melakukan penghapusan data terkait dalam transaksi database (testresult, testresultsubskala)
- Menghapus akun pengguna

### Check Password

**Endpoint:** `POST /user/check-password`

**Deskripsi:** Memeriksa apakah password yang diberikan sesuai dengan yang tersimpan.

**Headers:**
- Authorization: Bearer {accessToken}

**Request Body:**
```json
{
  "oldPassword": "password123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password verification complete",
  "data": {
    "isValid": true
  }
}
```

**Logika:**
- Menggunakan ID internal dari token untuk mencari pengguna
- Memverifikasi password menggunakan bcrypt.compare
- Mengembalikan status validasi password

### Change Password

**Endpoint:** `POST /user/change-password`

**Deskripsi:** Mengubah password pengguna.

**Headers:**
- Authorization: Bearer {accessToken}

**Request Body:**
```json
{
  "oldPassword": "password123",
  "newPassword": "newpassword123",
  "confirmPassword": "newpassword123"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Password changed successfully",
  "data": null
}
```

**Logika:**
- Menggunakan ID internal dari token untuk mencari pengguna
- Memverifikasi password lama
- Memastikan password baru dan konfirmasi password cocok
- Mengenkripsi password baru menggunakan bcrypt
- Memperbarui password di database

## Manajemen Blog

### Get Public Blogs

**Endpoint:** `GET /blog/public`

**Deskripsi:** Mendapatkan semua blog yang dipublikasikan tanpa memerlukan autentikasi.

**Response:**
```json
{
  "status": "success",
  "message": "Public blogs retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Blog Title 1",
      "content": "Blog content goes here",
      "coverImage": "https://example.com/images/blog1.jpg",
      "status": "PUBLISHED",
      "createdAt": "2025-05-01T12:00:00.000Z",
      "updatedAt": "2025-05-01T12:00:00.000Z",
      "author": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Author Name"
      }
    }
  ]
}
```

**Logika:**
- Mengembalikan semua blog dengan status PUBLISHED
- Tidak memerlukan autentikasi
- Menampilkan informasi dasar tentang penulis

### Create Blog

**Endpoint:** `POST /blog`

**Deskripsi:** Membuat blog baru.

**Headers:**
- Authorization: Bearer {accessToken}

**Request Body:**
```json
{
  "title": "New Blog Title",
  "content": "Blog content with formatting",
  "coverImage": "https://example.com/images/cover.jpg",
  "status": "DRAFT"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Blog created successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "New Blog Title",
    "content": "Blog content with formatting",
    "coverImage": "https://example.com/images/cover.jpg",
    "status": "DRAFT",
    "createdAt": "2025-05-06T12:00:00.000Z",
    "updatedAt": "2025-05-06T12:00:00.000Z",
    "authorId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Logika:**
- Memvalidasi input (title, content)
- Menggunakan UUID user sebagai authorId
- Blog status dapat berupa DRAFT atau PENDING
- Admin dapat langsung membuat blog dengan status PUBLISHED

### Get All Blogs

**Endpoint:** `GET /blog`

**Deskripsi:** Mendapatkan semua blog (hanya untuk Admin dan SuperAdmin).

**Headers:**
- Authorization: Bearer {accessToken}

**Response:**
```json
{
  "status": "success",
  "message": "All blogs retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Blog Title 1",
      "content": "Blog content goes here",
      "coverImage": "https://example.com/images/blog1.jpg",
      "status": "PUBLISHED",
      "createdAt": "2025-05-01T12:00:00.000Z",
      "updatedAt": "2025-05-01T12:00:00.000Z",
      "author": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Author Name"
      }
    }
  ]
}
```

**Logika:**
- Memerlukan hak akses ADMIN atau SUPER_ADMIN
- Mengembalikan semua blog tanpa memandang status
- Termasuk informasi author

### Get All Pending Blogs

**Endpoint:** `GET /blog/pending`

**Deskripsi:** Mendapatkan semua blog dengan status PENDING (hanya untuk SuperAdmin).

**Headers:**
- Authorization: Bearer {accessToken}

**Response:**
```json
{
  "status": "success",
  "message": "Pending blogs retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Pending Blog Title",
      "content": "Pending blog content",
      "coverImage": "https://example.com/images/pending.jpg",
      "status": "PENDING",
      "createdAt": "2025-05-05T12:00:00.000Z",
      "updatedAt": "2025-05-05T12:00:00.000Z",
      "author": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Author Name"
      }
    }
  ]
}
```

**Logika:**
- Memerlukan hak akses SUPER_ADMIN
- Mengembalikan hanya blog dengan status PENDING
- Digunakan untuk proses persetujuan konten

### Get User Blogs

**Endpoint:** `GET /blog/my-blogs`

**Deskripsi:** Mendapatkan semua blog yang dibuat oleh user yang sedang login.

**Headers:**
- Authorization: Bearer {accessToken}

**Response:**
```json
{
  "status": "success",
  "message": "User blogs retrieved successfully",
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "My Blog Title",
      "content": "My blog content",
      "coverImage": "https://example.com/images/myblog.jpg",
      "status": "DRAFT",
      "createdAt": "2025-05-03T12:00:00.000Z",
      "updatedAt": "2025-05-03T12:00:00.000Z"
    }
  ]
}
```

**Logika:**
- Mengambil UUID pengguna dari token
- Mengembalikan hanya blog yang dibuat oleh pengguna tersebut
- Menampilkan semua status blog (DRAFT, PENDING, PUBLISHED)

### Get Blog By ID

**Endpoint:** `GET /blog/:id`

**Deskripsi:** Mendapatkan detail blog berdasarkan UUID.

**Headers:**
- Authorization: Bearer {accessToken}

**Response:**
```json
{
  "status": "success",
  "message": "Blog retrieved successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Blog Title",
    "content": "Blog content with formatting",
    "coverImage": "https://example.com/images/blog.jpg",
    "status": "PUBLISHED",
    "createdAt": "2025-05-02T12:00:00.000Z",
    "updatedAt": "2025-05-02T12:00:00.000Z",
    "author": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "Author Name"
    }
  }
}
```

**Logika:**
- Memvalidasi UUID blog
- Memeriksa hak akses pengguna (author, admin, atau superadmin)
- Jika blog berstatus PUBLISHED, semua pengguna dapat melihatnya
- Jika blog berstatus DRAFT atau PENDING, hanya author atau admin yang dapat melihatnya

### Update Blog

**Endpoint:** `PUT /blog/:id`

**Deskripsi:** Memperbarui blog yang ada.

**Headers:**
- Authorization: Bearer {accessToken}

**Request Body:**
```json
{
  "title": "Updated Blog Title",
  "content": "Updated blog content",
  "coverImage": "https://example.com/images/updated.jpg",
  "status": "PENDING"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Blog updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Updated Blog Title",
    "content": "Updated blog content",
    "coverImage": "https://example.com/images/updated.jpg",
    "status": "PENDING",
    "createdAt": "2025-05-02T12:00:00.000Z",
    "updatedAt": "2025-05-06T12:00:00.000Z",
    "authorId": "550e8400-e29b-41d4-a716-446655440000"
  }
}
```

**Logika:**
- Memvalidasi UUID blog
- Memeriksa hak akses pengguna (hanya author, admin, atau superadmin yang dapat memperbarui)
- Memperbarui hanya field yang diberikan
- Memperbarui updatedAt timestamp
- Admin dapat mengubah status ke PUBLISHED, pengguna biasa hanya dapat mengubah ke DRAFT atau PENDING

### Delete Blog

**Endpoint:** `DELETE /blog/:id`

**Deskripsi:** Menghapus blog.

**Headers:**
- Authorization: Bearer {accessToken}

**Response:**
```json
{
  "status": "success",
  "message": "Blog deleted successfully",
  "data": null
}
```

**Logika:**
- Memvalidasi UUID blog
- Memeriksa hak akses pengguna (hanya author, admin, atau superadmin yang dapat menghapus)
- Melakukan soft delete atau hard delete sesuai kebijakan aplikasi

### Change Blog Status

**Endpoint:** `PUT /blog/:id/status`

**Deskripsi:** Mengubah status blog (hanya untuk SuperAdmin).

**Headers:**
- Authorization: Bearer {accessToken}

**Request Body:**
```json
{
  "status": "PUBLISHED"
}
```

**Response:**
```json
{
  "status": "success",
  "message": "Blog status updated successfully",
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "title": "Blog Title",
    "status": "PUBLISHED",
    "updatedAt": "2025-05-06T12:00:00.000Z"
  }
}
```

**Logika:**
- Memerlukan hak akses SUPER_ADMIN
- Memvalidasi UUID blog
- Memvalidasi status yang diberikan (DRAFT, PENDING, PUBLISHED)
- Mengubah hanya status blog

### Upload Blog Image

**Endpoint:** `POST /blog/upload-image`

**Deskripsi:** Mengunggah gambar untuk blog.

**Headers:**
- Authorization: Bearer {accessToken}

**Request Body (form-data):**
- image: [File]

**Response:**
```json
{
  "status": "success",
  "message": "Image uploaded successfully",
  "data": {
    "imageUrl": "https://example.com/uploads/blog/image-1683374400000.jpg"
  }
}
```

**Logika:**
- Memvalidasi tipe file (hanya gambar yang diperbolehkan)
- Memvalidasi ukuran file (maksimum 5MB)
- Menghasilkan nama unik untuk file
- Menyimpan file ke direktori yang sesuai
- Mengembalikan URL gambar yang dapat digunakan dalam konten blog

## Sistem Token

### Access Token

Access token adalah JWT yang berumur pendek (default: 1 hari) yang digunakan untuk mengakses API. Token ini berisi:
- ID internal pengguna
- UUID pengguna
- Waktu kedaluwarsa

Access token dikirim melalui header Authorization dalam format:
```
Authorization: Bearer {accessToken}
```

### Refresh Token

Refresh token adalah JWT yang berumur panjang (default: 7 hari) yang digunakan untuk mendapatkan access token baru tanpa perlu login ulang. Token ini berisi:
- ID internal pengguna
- UUID pengguna
- Tipe token ("refresh")
- Waktu kedaluwarsa

Refresh token tidak perlu dikirim dalam setiap request, hanya digunakan saat access token kedaluwarsa dengan memanggil endpoint `/auth/refresh-token`.

### Keamanan UUID

UUID digunakan sebagai ID publik untuk menghindari eksposur ID sequential internal. Ini membuat:
- ID pengguna tidak dapat diprediksi
- Mengurangi risiko keamanan dari serangan brute force dan enumerasi user
- Tetap mempertahankan performa dengan menggunakan ID numerik internal untuk relasi database