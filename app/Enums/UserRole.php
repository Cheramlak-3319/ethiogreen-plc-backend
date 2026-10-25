<?php

namespace App\Enums;

enum UserRole: string
{
    case Admin = 'admin';
    case Manager = 'manager';
    case Staff = 'staff';
    case Customer = 'customer';

    public function label(): string
    {
        return match ($this) {
            self::Admin => 'Administrator',
            self::Manager => 'Manager',
            self::Staff => 'Staff',
            self::Customer => 'Customer',
        };
    }

    public function canAccessErp(): bool
    {
        return in_array($this, [self::Admin, self::Manager, self::Staff], true);
    }

    /**
     * @return array<int, string>
     */
    public static function erpValues(): array
    {
        return [self::Admin->value, self::Manager->value, self::Staff->value];
    }
}
