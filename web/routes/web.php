<?php

use Shopify\Utils;
use Shopify\Context;
use App\Models\Session;
use Shopify\Auth\OAuth;
use App\Models\StoreData;
use Shopify\Clients\Rest;
use App\Lib\EnsureBilling;
use App\Lib\ProductCreator;
use App\Lib\AuthRedirection;
use Illuminate\Http\Request;
use Shopify\Webhooks\Topics;
use Shopify\Webhooks\Registry;
use Shopify\Clients\HttpHeaders;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Config;
use Shopify\Auth\Session as AuthSession;
use App\Http\Controllers\ShopifyController;
use App\Http\Controllers\ReorderController;
use App\Http\Controllers\CustomerController;
use App\Http\Controllers\OrderDataController;
use App\Http\Controllers\QnController;
use Shopify\Exception\InvalidWebhookException;
use App\Exceptions\ShopifyProductCreatorException;
use App\Http\Controllers\EmailPreferenceController;
use App\Http\Controllers\SessionController;


/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
| If you are adding routes outside of the /api path, remember to also add a
| proxy rule for them in web/frontend/vite.config.js
|
*/

Route::fallback(function (Request $request) {
    if (Context::$IS_EMBEDDED_APP &&  $request->query("embedded", false) === "1") {
        if (env('APP_ENV') === 'production') {
            return file_get_contents(public_path('index.html'));
        } else {
            return file_get_contents(base_path('frontend/index.html'));
        }
    } else {
        return redirect(Utils::getEmbeddedAppUrl($request->query("host", null)) . "/" . $request->path());
    }
})->middleware('shopify.installed');

Route::get('/api/auth', function (Request $request) {
    $shop = Utils::sanitizeShopDomain($request->query('shop'));

    // Delete any previously created OAuth sessions that were not completed (don't have an access token)
    Session::where('shop', $shop)->where('access_token', null)->delete();

    return AuthRedirection::redirect($request);
});

Route::get('/api/auth/callback', function (Request $request) {
    $session = OAuth::callback(
        $request->cookie(),
        $request->query(),
        ['App\Lib\CookieHandler', 'saveShopifyCookie'],
    );

    $host = $request->query('host');
    $shop = Utils::sanitizeShopDomain($request->query('shop'));

    $response = Registry::register('/api/webhooks', Topics::APP_UNINSTALLED, $shop, $session->getAccessToken());
    if ($response->isSuccess()) {
        Log::debug("Registered APP_UNINSTALLED webhook for shop $shop");
    } else {
        Log::error(
            "Failed to register APP_UNINSTALLED webhook for shop $shop with response body: " .
                print_r($response->getBody(), true)
        );
    }

    StoreData::getStoreData($session);

    $redirectUrl = Utils::getEmbeddedAppUrl($host);
    if (Config::get('shopify.billing.required')) {
        list($hasPayment, $confirmationUrl) = EnsureBilling::check($session, Config::get('shopify.billing'));

        if (!$hasPayment) {
            $redirectUrl = $confirmationUrl;
        }
    }

    return redirect($redirectUrl);
});

Route::post('/api/webhooks', function (Request $request) {
    try {
        $topic = $request->header(HttpHeaders::X_SHOPIFY_TOPIC, '');

        $response = Registry::process($request->header(), $request->getContent());
        if (!$response->isSuccess()) {
            Log::error("Failed to process '$topic' webhook: {$response->getErrorMessage()}");
            return response()->json(['message' => "Failed to process '$topic' webhook"], 500);
        }
    } catch (InvalidWebhookException $e) {
        Log::error("Got invalid webhook request for topic '$topic': {$e->getMessage()}");
        return response()->json(['message' => "Got invalid webhook request for topic '$topic'"], 401);
    } catch (\Exception $e) {
        Log::error("Got an exception when handling '$topic' webhook: {$e->getMessage()}");
        return response()->json(['message' => "Got an exception when handling '$topic' webhook"], 500);
    }
});

//Route::post('/api/get/shop', [OrderDataController::class, 'getDetails']);
Route::post('/api/get-qn-data', [QnController::class, 'getDetails']);
Route::post('/api/generate/qnid', [OrderDataController::class, 'generateQnId']);
Route::post('/api/send-password-reset', [ShopifyController::class, 'sendPasswordReset']);

Route::post('/api/update-metafields', [ShopifyController::class, 'updateOrCreateMetafields']);
Route::post('/api/update-mydetails', [CustomerController::class, 'updateCustomerDetails']);
Route::post('/api/update-reorder-metafields', [ReorderController::class, 'updateOrCreateMetafields']);
Route::post('/api/set-email-preference', [EmailPreferenceController::class, 'setPreferences']);

Route::middleware(['auth', 'update.last.activity'])->group(function () {
    Route::get('/api/check-session', [SessionController::class, 'checkSession']);
});
