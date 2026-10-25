<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('short-description', 'short_description');
        });

        Schema::table('products', function (Blueprint $table) {
            $table->foreignId('category_id')->nullable()->after('id')->constrained()->nullOnDelete();
            $table->decimal('cost_price', 12, 2)->default(0)->after('price');
            $table->unsignedInteger('stock_quantity')->default(0)->after('cost_price');
            $table->unsignedInteger('reorder_level')->default(5)->after('stock_quantity');
            $table->string('unit', 32)->default('pcs')->after('reorder_level');
            $table->boolean('is_active')->default(true)->after('unit');
            $table->boolean('is_featured')->default(false)->after('is_active');
            $table->string('hellopass_product_ref')->nullable()->after('is_featured');
            $table->index('is_active');
            $table->index('is_featured');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['category_id']);
            $table->dropIndex(['is_active']);
            $table->dropIndex(['is_featured']);
            $table->dropColumn([
                'category_id',
                'cost_price',
                'stock_quantity',
                'reorder_level',
                'unit',
                'is_active',
                'is_featured',
                'hellopass_product_ref',
            ]);
        });

        Schema::table('products', function (Blueprint $table) {
            $table->renameColumn('short_description', 'short-description');
        });
    }
};
