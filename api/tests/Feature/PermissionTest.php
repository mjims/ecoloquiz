<?php

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;

use function Pest\Laravel\actingAs;

uses(RefreshDatabase::class);

test('can list all permissions with proper permission', function () {
    $user = User::factory()->create();
    $permission = Permission::create(['name' => 'permissions.view', 'description' => 'View permissions']);
    $role = Role::create(['name' => 'admin', 'description' => 'Admin role']);
    $role->permissions()->attach($permission->id);
    $user->roles()->attach($role->id);

    Permission::create(['name' => 'users.view', 'description' => 'View users']);
    Permission::create(['name' => 'users.edit', 'description' => 'Edit users']);

    $response = actingAs($user, 'api')->getJson('/api/permissions');

    $response->assertSuccessful()
        ->assertJsonStructure([
            '*' => ['id', 'name', 'description', 'created_at', 'updated_at'],
        ]);
});

test('cannot list permissions without permission', function () {
    $user = User::factory()->create();

    $response = actingAs($user, 'api')->getJson('/api/permissions');

    $response->assertForbidden();
});

test('can create a permission with proper permission', function () {
    $user = User::factory()->create();
    $permission = Permission::create(['name' => 'permissions.create', 'description' => 'Create permissions']);
    $role = Role::create(['name' => 'admin', 'description' => 'Admin role']);
    $role->permissions()->attach($permission->id);
    $user->roles()->attach($role->id);

    $response = actingAs($user, 'api')->postJson('/api/permissions', [
        'name' => 'products.view',
        'description' => 'View products',
    ]);

    $response->assertCreated()
        ->assertJsonStructure(['message', 'data']);

    $this->assertDatabaseHas('permissions', [
        'name' => 'products.view',
    ]);
});

test('cannot create permission without proper permission', function () {
    $user = User::factory()->create();

    $response = actingAs($user, 'api')->postJson('/api/permissions', [
        'name' => 'products.view',
        'description' => 'View products',
    ]);

    $response->assertForbidden();
});

test('validates required fields when creating permission', function () {
    $user = User::factory()->create();
    $permission = Permission::create(['name' => 'permissions.create', 'description' => 'Create permissions']);
    $role = Role::create(['name' => 'admin', 'description' => 'Admin role']);
    $role->permissions()->attach($permission->id);
    $user->roles()->attach($role->id);

    $response = actingAs($user, 'api')->postJson('/api/permissions', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name']);
});

test('can update a permission with proper permission', function () {
    $user = User::factory()->create();
    $permissionToEdit = Permission::create(['name' => 'old.name', 'description' => 'Old description']);
    $permission = Permission::create(['name' => 'permissions.edit', 'description' => 'Edit permissions']);
    $role = Role::create(['name' => 'admin', 'description' => 'Admin role']);
    $role->permissions()->attach($permission->id);
    $user->roles()->attach($role->id);

    $response = actingAs($user, 'api')->putJson("/api/permissions/{$permissionToEdit->id}", [
        'name' => 'new.name',
        'description' => 'New description',
    ]);

    $response->assertSuccessful()
        ->assertJsonStructure(['message', 'data']);

    $this->assertDatabaseHas('permissions', [
        'id' => $permissionToEdit->id,
        'name' => 'new.name',
    ]);
});

test('can delete a permission with proper permission', function () {
    $user = User::factory()->create();
    $permissionToDelete = Permission::create(['name' => 'to.delete', 'description' => 'To delete']);
    $permission = Permission::create(['name' => 'permissions.delete', 'description' => 'Delete permissions']);
    $role = Role::create(['name' => 'admin', 'description' => 'Admin role']);
    $role->permissions()->attach($permission->id);
    $user->roles()->attach($role->id);

    $response = actingAs($user, 'api')->deleteJson("/api/permissions/{$permissionToDelete->id}");

    $response->assertSuccessful();

    $this->assertSoftDeleted('permissions', [
        'id' => $permissionToDelete->id,
    ]);
});
