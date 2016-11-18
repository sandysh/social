<?php
/**
 * Author: Dipesh Rijal
 * Date:   2016-09-18 02:22:19
 * Last Modified by:   Dipesh Rijal
 * Last Modified time: 2016-09-18 02:34:00
 */
namespace App\Providers;

use Illuminate\Support\ServiceProvider;

class FractalServiceProvider extends ServiceProvider
{
    /**
     * Bootstrap the application services.
     *
     * @return void
     */
    public function boot()
    {
        $fractal = $this->app->make('League\Fractal\Manager');

        response()->macro('item', function ($item, \League\Fractal\TransformerAbstract $transformer, $name, $status = 200, array $headers = []) use ($fractal) {
            $resource = new \League\Fractal\Resource\Item($item, $transformer, $name);

            return response()->json(
                $fractal->createData($resource)->toArray(),
                $status,
                $headers
            );
        });

        response()->macro('collection', function ($collection, \League\Fractal\TransformerAbstract $transformer, $name, $status = 200, array $headers = []) use ($fractal) {
            $resource = new \League\Fractal\Resource\Collection($collection, $transformer, $name);

            return response()->json(
                $fractal->createData($resource)->toArray(),
                $status,
                $headers
            );
        });
    }

    /**
     * Register the application services.
     *
     * @return void
     */
    public function register()
    {
        $this->app->bind('League\Fractal\Manager', function ($app) {
            $manager = new \League\Fractal\Manager;
            $manager->setSerializer(new \League\Fractal\Serializer\JsonApiSerializer);

            return $manager;
        });
    }
}
