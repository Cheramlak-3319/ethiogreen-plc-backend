<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    public function definition(): array
    {
        $name = fake()->unique()->words(3, true);
        $price = fake()->randomFloat(2, 5, 30);
        $images = [
            'images/products/apricot.jpg',
            'images/products/cherry.jpg',
            'images/products/date.jpg',
            'images/products/eggplant.jpg',
            'images/products/fig.jpg',
            'images/products/grape.jpg',
            'images/products/lime.jpg',
            'images/products/okra.jpg',
            'images/products/onion.jpg',
            'images/products/peach.jpg',
            'images/products/pear.jpg',
            'images/products/pepper.jpg',
            'images/products/plum.jpg',
            'images/products/papaya.jpg',
            'images/products/tomato.jpg',
        ];

        return [
            'category_id' => Category::factory(),
            'name' => Str::title($name),
            'slug' => Str::slug($name).'-'.fake()->unique()->numberBetween(100, 99999),
            'sku' => 'SKU-'.Str::upper(Str::random(8)),
            'image' => fake()->randomElement($images),
            'description' => fake()->paragraph(),
            'short_description' => fake()->sentence(),
            'price' => $price,
            'cost_price' => round($price * 0.65, 2),
            'stock_quantity' => fake()->numberBetween(10, 250),
            'reorder_level' => 10,
            'unit' => 'pcs',
            'is_active' => true,
            'is_featured' => fake()->boolean(30),
        ];
    }
}
