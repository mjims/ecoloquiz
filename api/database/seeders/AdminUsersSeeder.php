<?php

namespace Database\Seeders;

use App\Models\Admin;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class AdminUsersSeeder extends Seeder
{
    public function run()
    {
        DB::transaction(function () {
            // You can remove the deletes in prod
            // DB::table('role_user')->delete();
            // DB::table('admins')->delete();
            // DB::table('users')->delete();

            // Find role ids
            $roles = DB::table('roles')->pluck('id', 'name')->toArray();

            // Create sample users (admins)
            $admins = [
                [
                    'id' => (string) Str::uuid(),
                    'email' => 'superadmin@ecoloquiz.test',
                    'first_name' => 'Super',
                    'last_name' => 'Admin',
                    'password' => Hash::make('SuperStrongPassword!123'), // change in prod
                ],
                [
                    'id' => (string) Str::uuid(),
                    'email' => 'mairie@ecoloquiz.test',
                    'first_name' => 'Maire',
                    'last_name' => 'Partenaire',
                    'password' => Hash::make('MairiePass!123'),
                ],
                [
                    'id' => (string) Str::uuid(),
                    'email' => 'sponsor@ecoloquiz.test',
                    'first_name' => 'Sponsor',
                    'last_name' => 'Partenaire',
                    'password' => Hash::make('SponsorPass!123'),
                ],
            ];

            foreach ($admins as $a) {
                // Create user if not exists by email
                $user = User::where('email', $a['email'])->first();
                if (! $user) {
                    $user = User::create([
                        'id' => $a['id'],
                        'email' => $a['email'],
                        'first_name' => $a['first_name'],
                        'last_name' => $a['last_name'],
                        'password' => $a['password'],
                        'status' => 'ACTIVE',
                    ]);
                }

                // Attach role
                $roleName = match ($a['email']) {
                    'superadmin@ecoloquiz.test' => 'superadmin',
                    'mairie@ecoloquiz.test' => 'partner_mayor',
                    'sponsor@ecoloquiz.test' => 'partner_sponsor',
                    default => 'superadmin'
                };

                if (isset($roles[$roleName])) {
                    $roleId = $roles[$roleName];
                    // Insert pivot if not exists
                    $exists = DB::table('role_user')->where('role_id', $roleId)->where('user_id', $user->id)->exists();
                    if (! $exists) {
                        DB::table('role_user')->insert([
                            'role_id' => $roleId,
                            'user_id' => $user->id,
                        ]);
                    }
                }

                // Create admin record (back-office admin entry)
                $admin = Admin::where('user_id', $user->id)->first();
                if (! $admin) {
                    Admin::create([
                        'id' => (string) Str::uuid(),
                        'user_id' => $user->id,
                        'role' => $roleName,
                    ]);
                }
            }
        });
    }
}
