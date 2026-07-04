<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Seed Admin User
        User::firstOrCreate(
            ['username' => 'admin'],
            [
                'name' => 'Guru / Admin',
                'role' => 'admin',
                'password' => \Illuminate\Support\Facades\Hash::make('admin123'),
            ]
        );

        // Seed Sample Students
        $students = [
            ['name' => 'Rafi Pratama', 'nis' => '2024001', 'school' => 'SMAN 1 Surabaya'],
            ['name' => 'Dian Anggraeni', 'nis' => '2024002', 'school' => 'SMAN 1 Surabaya'],
            ['name' => 'Sari Dewi', 'nis' => '2024003', 'school' => 'SMAN 1 Surabaya'],
            ['name' => 'Budi Santoso', 'nis' => '2024004', 'school' => 'SMAN 1 Surabaya'],
            ['name' => 'Aldi Prasetyo', 'nis' => '2024005', 'school' => 'SMAN 1 Surabaya'],
            ['name' => 'Nina Lestari', 'nis' => '2024006', 'school' => 'SMAN 1 Surabaya'],
        ];

        foreach ($students as $s) {
            User::firstOrCreate(
                ['nis' => $s['nis']],
                [
                    'name' => $s['name'],
                    'school' => $s['school'],
                    'role' => 'student',
                ]
            );
        }
    }
}
