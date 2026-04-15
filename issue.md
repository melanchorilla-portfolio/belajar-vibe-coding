# Fitur Login User & Manajemen Session

## Deskripsi Tugas
Tugas ini bertujuan untuk membangun fitur autentikasi (login pengguna) di mana jika proses login berhasil, pengguna akan diberikan sebuah token sesi (*session* berupa UUID) yang disimpan di tabel database baru. Tugas ini sudah disiapkan terarah agar junior programmer bisa langsung mengimplementasikannya. Silakan jalankan langkah-langkah di bawah ini secara sistematis.

---

## Tahap 1: Pembuatan Skema Database (Tabel Sessions)
Tahap awal berfokus pada penambahan tabel ke skema Drizzle saat ini.
1. Buka file `src/db/schema.ts`.
2. Tambahkan definisi tabel baru bernama `sessions`. Struktur tabelnya adalah sebagai berikut:
   - `id`: bertipe `integer`, *auto increment*, bertindak sebagai *primary key*.
   - `token`: bertipe `varchar(255)` dan tidak boleh kosong (`not null`). Kolom ini akan menyimpan string UUID, disarankan juga menambahkan fungsi pembeda (`unique()`).
   - `user_id`: bertipe `integer`, tidak boleh kosong (`not null`), dan ini berfungsi sebagai relasi/referensi (Foreign Key) yang merujuk pada `id` di tabel `users`.
   - `created_at`: bertipe `timestamp` dengan fungsi bawaan penyetel default waktu sekarang (`default()`).
   - `updated_at`: bertipe `timestamp` dengan fungsi bawaan yang akan otomatis memperbarui datanya bila ada perbaruan rekor.
3. Setelah memperbarui `schema.ts`, dorong skema baru ini langsung ke database sesungguhnya lewat komando di terminal, yaitu: `bun run db:push`.

---

## Tahap 2: Penambahan Logika Bisnis (Services)
Logika untuk login akan dititipkan pada layer *service*.
1. Buka file `src/services/users-service.ts`.
2. Tambahkan suatu fungsi *asynchronous* baru dengan nama `login`, yang dapat menerima parameter objek berupa `email` dan `password` asli.
3. Rancang alur fungsi `login` tersebut sebagai berikut:
   - **Query User:** Cari dan ambil data user tunggal secara spesifik dari tabel `users` (drizzle) yang nilai dari field `email`-nya sama persis dengan argumen `email`.
   - **Cek Kepemilikan:** Apabila tidak ditemukan baris apapun dari pencarian di atas, langsung kembalikan *return* berupa error (*object* maupun *throw error*) dengan pesan: `"Email atau password salah"`.
   - **Verifikasi Sandi:** Jika user ditemukan, lanjutkan untuk memverifikasi `password`. Manfaatkan fungsi komparasi native dari tipe hash sebelumnya: `await Bun.password.verify("password_plain_input", hash_yang_ada_di_database)`.
   - **Penanganan Sandi Salah:** Jika proses verifikasi dinyatakan tak valid (salah), kembalikan pesan error yang sama persis `"Email atau password salah"` dengan pengecekan kepemilikan. Jangan pernah membedakan pesan error-nya demi keamanan.
   - **Generate Token:** Jika `email` dan `password` valid seratus persen, ciptakan sebuah token berbasis UUID. (Kamu bisa memanfaatkan `crypto.randomUUID()`).
   - **Simpan Sesi:** Tulis baris baru *(insert)* ke tabel `sessions` menggunakan Drizzle. Berikan nilai field `user_id` milik user saat ini, serta `token` UUID tadi.
   - **Pengembalian Hasil:** Proses usai, return string token UUID tersebut `{ "data": "<kode_uuid>" }`.

---

## Tahap 3: Pembuatan Layer Endpoint (Routes)
Tahap ini untuk memasang *controller/router* baru yang mengeksekusi fungsionalitas di Tahap 2.
1. Buka file `src/routes/users-route.ts`.
2. Karena endpoint rute yang diinginkan adalah `POST /api/users/login`, maka kamu hanya perlu menambahkan sambungan metoda `.post('/users/login', ...)` pada struktur blok rantaian Elysia (*chain*) yang ada.
3. Di dalam *handler* parameter login:
   - Verifikasi *request body*, pastikan `email` dan `password` merupakan input bertipe data string.
   - Panggil fungsi `login` dari `users-service.ts` yang kamu ciptakan dengan melempar parameter email dan rentetan sandinya.
   - Analisa hasilnya. Jika alur `users-service.ts` gagal (terdapat error karena kredensial), kirimkan balasannya menjadi body JSON:
     ```json
     {
         "error": "Email atau password salah"
     }
     ```
     (Jika bisa, rubah HTTP Status ke 400 atau 401).
   - Apabila login lancar, kembalikan balasannya menjadi JSON:
     ```json
     {
         "data": "a3f5b721-e83c-..."
     }
     ```

---

## Tahap 4: Verifikasi & Uji Coba
1. Pastikan Elysia dalam keadaan berjalan (`bun run dev`).
2. Gunakan Postman, cURL, Thunder Client atau semacamnya, dan kirimkan `POST` *request* ke `http://localhost:3000/api/users/login`.
3. Paksa skenario kegagalan: cobalah memasukkan sandi asalan. Server harus mengembalikan pesan yang diinstruksikan tanpa memberhentikan aplikasi.
4. Uji kelancaran: cobalah masuk menggunakan surel dan sandi pendaftaran pada tugas terdahulu. Anda akan menerima Token. Mengecek database juga diperlukan untuk melihah sesi yang ter-katalog masuk ke tabel `sessions`.
