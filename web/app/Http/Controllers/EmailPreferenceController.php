<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class EmailPreferenceController extends Controller
{
    public function setPreferences(Request $request)
    {
        try {
            $customerId = $request->input('customerId');
            $shopName = $request->input('shopName');
            $tags = $this->getCustomerTags($customerId, $shopName);
            $defaultEmailPreference = in_array('Subscriber', $tags);
            $metafields = [
                [
                    'namespace' => 'custom',
                    'key' => 'email_preference',
                    'value' => $defaultEmailPreference ? 'true' : 'false',
                    'type' => 'boolean',
                ]
            ];

            $this->updateCustomerMetafields($customerId, $metafields, $shopName);

            return response()->json(['message' => 'Email preferences set successfully']);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Failed to set email preference'], 500);
        }
    }

    private function getCustomerTags($customerId, $shopName)
    {	
        $client = new Client();
        $response = $client->post("https://{$shopName}/admin/api/2024-07/graphql.json", [
            'headers' => [
                'Content-Type' => 'application/json',
                'X-Shopify-Access-Token' => $this->getAccessToken($shopName),
            ],
            'json' => [
                'query' => '{
                    customer(id: "' . $customerId . '") {
                        id
                        tags
                    }
                }',
            ],
            'verify' => false,
        ]);

        $customerTags = json_decode($response->getBody()->getContents(), true);
        return $customerTags['data']['customer']['tags'] ?? [];
    }

private function updateCustomerMetafields($customerId, $metafields, $shopName)
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

    foreach ($metafields as &$metafield) {
        $metafield['ownerId'] = $customerId; 
    }

    $response = $this->makeGraphQLRequest($mutation, ['metafields' => $metafields], $shopName);
   
    if ($response) {
        Log::info("Email Preference set.");
    } else {
        Log::error("GraphQL request failed.");
    }
}


    private function makeGraphQLRequest($query, $variables, $storeName)
    {
        $accessToken = $this->getAccessToken($storeName);
        if ($accessToken) {
            $client = new Client();
            $response = $client->post("https://{$storeName}/admin/api/2024-07/graphql.json", [
                'headers' => [
                    'X-Shopify-Access-Token' => $accessToken,
                    'Content-Type' => 'application/json',
                ],
                'body' => json_encode(['query' => $query, 'variables' => $variables]),
                'verify' => false, 
            ]);
            return json_decode($response->getBody()->getContents(), true);
        }
    }

    private function getAccessToken($shopName)
    {
        $accessToken = DB::table('shops')->where('store', $shopName)->first();
        return $accessToken->access_token ?? null;
    }
}

