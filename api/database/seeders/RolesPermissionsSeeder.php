<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class RolesPermissionsSeeder extends Seeder
{
    public function run()
    {
        DB::transaction(function () {
            // Clear old if exists (safe for dev only)
            DB::table('permission_role')->delete();
            DB::table('role_user')->delete();
            DB::table('permissions')->delete();
            DB::table('roles')->delete();

            // Create permissions (exemples utiles pour l'admin)
            $permissions = [
                ['id' => (string) Str::uuid(), 'name' => 'manage_users', 'description' => 'Manage users'],
                ['id' => (string) Str::uuid(), 'name' => 'manage_templates', 'description' => 'Manage email templates'],
                ['id' => (string) Str::uuid(), 'name' => 'manage_campaigns', 'description' => 'Manage campaigns'],
                ['id' => (string) Str::uuid(), 'name' => 'manage_zones', 'description' => 'Manage zones and companies'],
                ['id' => (string) Str::uuid(), 'name' => 'view_stats', 'description' => 'View statistics'],
                ['id' => (string) Str::uuid(), 'name' => 'manage_gifts', 'description' => 'Manage gifts & allocations'],
                ['id' => (string) Str::uuid(), 'name' => 'manage_content', 'description' => 'Manage pages and blog'],
            ];
            DB::table('permissions')->insert($permissions);

            // Create roles
            $roles = [
                ['id' => (string) Str::uuid(), 'name' => 'superadmin', 'description' => 'Full access'],
                ['id' => (string) Str::uuid(), 'name' => 'partner_mayor', 'description' => 'Mairie partner limited admin'],
                ['id' => (string) Str::uuid(), 'name' => 'partner_sponsor', 'description' => 'Sponsor partner limited admin'],
            ];
            DB::table('roles')->insert($roles);

            // Attach permissions to roles
            // superadmin => all
            $allPermissionIds = array_column($permissions, 'id');
            $superadminRoleId = $roles[0]['id'];

            $inserts = [];
            foreach ($allPermissionIds as $pid) {
                $inserts[] = [
                    'permission_id' => $pid,
                    'role_id' => $superadminRoleId,
                ];
            }

            // partner_mayor => manage_users, manage_zones, view_stats
            $partnerMayorPerms = array_filter($permissions, function ($p) {
                return in_array($p['name'], ['manage_users', 'manage_zones', 'view_stats']);
            });
            foreach ($partnerMayorPerms as $p) {
                $inserts[] = ['permission_id' => $p['id'], 'role_id' => $roles[1]['id']];
            }

            // partner_sponsor => manage_gifts, view_stats
            $partnerSponsorPerms = array_filter($permissions, function ($p) {
                return in_array($p['name'], ['manage_gifts', 'view_stats']);
            });
            foreach ($partnerSponsorPerms as $p) {
                $inserts[] = ['permission_id' => $p['id'], 'role_id' => $roles[2]['id']];
            }

            if (! empty($inserts)) {
                DB::table('permission_role')->insert($inserts);
            }
        });
    }
}
