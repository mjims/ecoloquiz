<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

test('can list all roles with proper permission', function () {
    $user = User::factory()->create();
    $permission = Permission::create(['name' => 'roles.view', 'description' => 'View roles']);
    $role = Role::create(['name' => 'admin', 'description' => 'Admin role']);
    $role->permissions()->attach($permission->id);
    $user->roles()->attach($role->id);

    Role::create(['name' => 'editor', 'description' => 'Editor role']);
    Role::create(['name' => 'viewer', 'description' => 'Viewer role']);

    $response = actingAs($user, 'api')->getJson('/api/roles');

    $response->assertSuccessful()
        ->assertJsonStructure([
            '*' => ['id', 'name', 'description', 'permissions', 'permissions_count', 'created_at', 'updated_at'],
        ]);
});

test('cannot list roles without permission', function () {
    $user = User::factory()->create();

    $response = actingAs($user, 'api')->getJson('/api/roles');

    $response->assertForbidden();
});

test('can create a role with permissions', function () {
    $user = User::factory()->create();
    $permission = Permission::create(['name' => 'roles.create', 'description' => 'Create roles']);
    $role = Role::create(['name' => 'admin', 'description' => 'Admin role']);
    $role->permissions()->attach($permission->id);
    $user->roles()->attach($role->id);

    $perm1 = Permission::create(['name' => 'users.view', 'description' => 'View users']);
    $perm2 = Permission::create(['name' => 'users.edit', 'description' => 'Edit users']);

    $response = actingAs($user, 'api')->postJson('/api/roles', [
        'name' => 'moderator',
        'description' => 'Moderator role',
        'permissions' => [$perm1->id, $perm2->id],
    ]);

    $response->assertCreated()
        ->assertJsonStructure(['message', 'data']);

    $this->assertDatabaseHas('roles', [
        'name' => 'moderator',
    ]);

    $createdRole = Role::where('name', 'moderator')->first();
    expect($createdRole->permissions)->toHaveCount(2);
});

test('cannot create role without proper permission', function () {
    $user = User::factory()->create();

    $response = actingAs($user, 'api')->postJson('/api/roles', [
        'name' => 'moderator',
        'description' => 'Moderator role',
    ]);

    $response->assertForbidden();
});

test('validates required fields when creating role', function () {
    $user = User::factory()->create();
    $permission = Permission::create(['name' => 'roles.create', 'description' => 'Create roles']);
    $role = Role::create(['name' => 'admin', 'description' => 'Admin role']);
    $role->permissions()->attach($permission->id);
    $user->roles()->attach($role->id);

    $response = actingAs($user, 'api')->postJson('/api/roles', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

test('validates permissions array when creating role', function () {
    $user = User::factory()->create();
    $permission = Permission::create(['name' => 'roles.create', 'description' => 'Create roles']);
    $role = Role::create(['name' => 'admin', 'description' => 'Admin role']);
    $role->permissions()->attach($permission->id);
    $user->roles()->attach($role->id);

    $response = actingAs($user, 'api')->postJson('/api/roles', [
        'name' => 'moderator',
        'permissions' => ['invalid-uuid'],
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['permissions.0']);
});

test('can update a role with proper permission', function () {
    $user = User::factory()->create();
    $roleToEdit = Role::create(['name' => 'old-name', 'description' => 'Old description']);
    $permission = Permission::create(['name' => 'roles.edit', 'description' => 'Edit roles']);
    $role = Role::create(['name' => 'admin', 'description' => 'Admin role']);
    $role->permissions()->attach($permission->id);
    $user->roles()->attach($role->id);

    $perm1 = Permission::create(['name' => 'users.view', 'description' => 'View users']);

    $response = actingAs($user, 'api')->putJson("/api/roles/{$roleToEdit->id}", [
        'name' => 'new-name',
        'description' => 'New description',
        'permissions' => [$perm1->id],
    ]);

    $response->assertSuccessful()
        ->assertJsonStructure(['message', 'data']);

    $this->assertDatabaseHas('roles', [
        'id' => $roleToEdit->id,
        'name' => 'new-name',
    ]);
});

test('can delete a role with proper permission', function () {
    $user = User::factory()->create();
    $roleToDelete = Role::create(['name' => 'to-delete', 'description' => 'To delete']);
    $permission = Permission::create(['name' => 'roles.delete', 'description' => 'Delete roles']);
    $role = Role::create(['name' => 'admin', 'description' => 'Admin role']);
    $role->permissions()->attach($permission->id);
    $user->roles()->attach($role->id);

    $response = actingAs($user, 'api')->deleteJson("/api/roles/{$roleToDelete->id}");

    $response->assertSuccessful();

    $this->assertSoftDeleted('roles', [
        'id' => $roleToDelete->id,
    ]);
});

test('can retrieve a specific role with permissions', function () {
    $user = User::factory()->create();
    $permission = Permission::create(['name' => 'roles.view', 'description' => 'View roles']);
    $role = Role::create(['name' => 'admin', 'description' => 'Admin role']);
    $role->permissions()->attach($permission->id);
    $user->roles()->attach($role->id);

    $testRole = Role::create(['name' => 'test-role', 'description' => 'Test role']);
    $perm1 = Permission::create(['name' => 'users.view', 'description' => 'View users']);
    $testRole->permissions()->attach($perm1->id);

    $response = actingAs($user, 'api')->getJson("/api/roles/{$testRole->id}");

    $response->assertSuccessful()
        ->assertJsonStructure([
            'id',
            'name',
            'description',
            'permissions',
            'created_at',
            'updated_at',
        ]);
});
