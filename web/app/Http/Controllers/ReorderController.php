<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ReorderController extends Controller
{
    public function updateOrCreateMetafields(Request $request)
    {
        $customerId = $request->input('customerId');
        $metafield = $request->input('metafield'); 
        $shopName = $request->input('shopName');
        $action = $request->input('action');

        if ($metafield === null) {
            return response()->json(['success' => false, 'error' => 'Metafield data is missing'], 400);
        }

        $formattedMetafields = [
            [
                'ownerId' => $customerId,
                'namespace' => $metafield['namespace'],
                'key' => $metafield['key'],
                'value' => $metafield['value'],
                'type' => $metafield['type'],
            ]
        ];

        if ($action === 'reorder') {
            $response = $this->updateCustomerMetafields($formattedMetafields, $shopName);
            if (isset($response['errors'])) {
                return response()->json(['success' => false, 'error' => $response['errors']], 400);
            }
            return response()->json(['success' => true, 'message' => 'Metafields processed successfully']);
        } else {
            return response()->json(['success' => false, 'error' => 'Invalid action'], 400);
        }
    }

    private function updateCustomerMetafields($metafields, $shopName)
    {
        $mutation = <<<GRAPHQL
        mutation MetafieldsSet(\$metafields: [MetafieldsSetInput!]!) {
            metafieldsSet(metafields: \$metafields) {
                metafields {
                    key
                    namespace
                    value
                    createdAt
                    updatedAt
                }
                userErrors {
                    field
                    message
                    code
                }
            }
        }
        GRAPHQL;

        $response = $this->makeGraphQLRequest($mutation, ['metafields' => $metafields], $shopName);
        Log::debug('Update or Create Customer Metafield Response', ['response' => $response]);

        return $response;
    }

    private function makeGraphQLRequest($query, $variables, $storeName)
    {
        $accessToken = DB::table('shops')->where('store', $storeName)->first();

        if (isset($accessToken)) {
            $client = new Client();
            $response = $client->post("https://{$storeName}/admin/api/2024-07/graphql.json", [
                'headers' => [
                    'X-Shopify-Access-Token' => $accessToken->access_token,
                    'Content-Type' => 'application/json',
                ],
                'body' => json_encode(['query' => $query, 'variables' => $variables]),
                'verify' => false, 
            ]);

            return json_decode($response->getBody()->getContents(), true);
        }

        return ['errors' => 'Access token not found for the store'];
    }
}

