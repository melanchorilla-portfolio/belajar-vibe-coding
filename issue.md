# Fitur Registrasi User & Struktur Aplikasi Dasar

## Deskripsi Tugas
Tugas ini bertujuan untuk membuat fitur registrasi pengguna (user registration) dengan menggunakan ElysiaJS dan Drizzle ORM, beserta penataan struktur folder aplikasi. Silakan ikuti langkah-langkah di bawah ini secara sistematis.

---

## Tahap 1: Pembuatan Skema Database
Tahap pertama adalah mempersiapkan tabel database untuk menyimpan data user.
1. Buka file skema database (terdapat di `src/db/schema.ts` atau buat jika kamu mengubah strukturnya).
2. Sesuaikan atau buat definisi tabel `users` untuk menyamai spesifikasi berikut:
   - `id`: bertipe `integer`, *auto increment*, dan bertindak sebagai *primary key*.
   - `name`: bertipe `varchar(255)` dan tidak boleh null (`not null`).
   - `email`: bertipe `varchar(255)` dan tidak boleh null (`not null`). Disarankan memberikan *constraint unique* pada field ini.
   - `password`: bertipe `varchar(255)` dan tidak boleh null (`not null`). Kolom ini nanti akan menyimpan hasil hash dari bcrypt.
   - `created_at`: bertipe `timestamp` dengan nilai default waktu saat data dimasukkan (`default current_timestamp`).
   - `updated_at`: bertipe `timestamp` dengan kemampuan ter-update secara otomatis (`on update current_timestamp` di Drizzle MySQL).
3. Setelah skema ditambahkan/diperbarui, dorong (*push*) perubahan ini ke MySQL dengan menjalankan komando Drizzle-kit di terminal (contoh: `bun run db:push`).

---

## Tahap 2: Pembuatan Layer Business Logic (Services)
Logika atau alur kerja inti dari fitur dipisahkan dari routing.
1. Buat folder `src/services`.
2. Di dalamnya, buat file `users-service.ts`.
3. Buat sebuah fungsi *asynchronous* untuk proses registrasi, yang menerima parameter *name*, *email*, dan *password* asli.
4. Di dalam fungsi ini jalankan logika berurutan berikut:
   - **Pengecekan:** Cari ke tabel database lewat Drizzle apakah `email` yang diberikan sudah ada dari user lain.
   - **Validasi:** Jika `email` sudah ada, hentikan proses dan kembalikan penanda error. (Kamu bisa melakukan *throw Error* yang nanti ditangkap oleh Elysia, atau mengembalikan sebuah flag/object yang menandakan error berupa `"Email sudah terdaftar"`).
   - **Hashing:** Jika pengecekan berlalu (email belum ada), lakukan *hash* pada password tersebut menggunakan Bcrypt. (Petunjuk: Kamu bisa memanfaatkan native fungsi Bun: `await Bun.password.hash("password_plain", "bcrypt")`).
   - **Penyimpanan:** *Insert* data pengguna baru (nama, email, dan password yang sudah di-*hash*) ke database.
   - **Sukses:** Kembalikan nilai `{ "data": "OK" }` jika semua instruksi di atas berjalan mulus.

---

## Tahap 3: Pembuatan Layer Endpoint (Routes)
Tahap ini untuk memasang *controller/router* yang menangkap *request* HTTP dan berinteraksi ke *Service*.
1. Buat folder `src/routes`.
2. Di dalamnya, buat file `users-route.ts`.
3. Definisikan route menggunakan module Elysia.
4. Buat sebuah endpoint dengan HTTP method `POST` dan rute: `/api/users`.
5. Di dalam *handler* endpoint ini:
   - Tangkap data dari *request body* (`name`, `email`, dan `password`).
   - Panggil fungsi registrasi yang kamu buat di file `users-service.ts` sebelumnya dengan menyisipkan ketiga data tersebut.
   - Tangkap balasan dari *service*.
   - Jika proses gagal (berdasarkan hasil *service* di tahap 2), berikan *response HTTP error* dengan body JSON:
     ```json
     {
         "error": "Email sudah terdaftar"
     }
     ```
   - Jika berhasil, berikan *response* HTTP sukses dengan body JSON:
     ```json
     {
         "data": "OK"
     }
     ```

---

## Tahap 4: Menyatukan Ke Main App (Index)
Setelah route dibuat, aplikasi utama tidak akan bereaksi kalau module rute belum didaftarkan.
1. Buka file entry server, yaitu `src/index.ts`.
2. Lakukan import atas modul yang *di-export* oleh `users-route.ts`.
3. Hubungkan/Use module tersebut ke instance Elysia utama yang menopang *server*.
4. Uji aplikasi keseluruhan. Gunakan aplikasi Postman/Thunder Client untuk melakukan *Request* POST ke `http://localhost:3000/api/users` dengan body:
   ```json
   {
       "name": "John Doe",
       "email": "testing@email.com",
       "password": "password"
   }
   ```
   Pastikan hasilnya sukses pertama kali, dan menghasilkan error ketika kamu mengulangi *request* yang sama.
