<?php

declare(strict_types=1);

namespace App\Models;

use Shopify\Auth\Session;
use Illuminate\Support\Facades\DB;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class StoreData extends Model
{
    use HasFactory;

    public static function getStoreData(Session $session)
    {
        $tblExist = DB::table('shops')->where('store', trim($session->getShop()))->first();
        if ($tblExist) {
            $array = array(
                'access_token' => trim($session->getAccessToken()),
                'updated_at' => now()
            );
            DB::table('shops')->where('id', $tblExist->id)->update($array);
        } else {
            $array = array(
                'store' => trim($session->getShop()),
                'access_token' => trim($session->getAccessToken()),
                'created_at' => now()
            );
            DB::table('shops')->insert($array);
        }
    }
}
