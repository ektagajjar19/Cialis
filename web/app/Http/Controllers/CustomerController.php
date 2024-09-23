<?php

namespace App\Http\Controllers;

use GuzzleHttp\Client;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class CustomerController extends Controller
{
    protected $shopifyApiVersion = '2024-07';

    protected function shopifyRequest($shopName, $accessToken, $query, $variables = [])
    {
        $baseUri = "https://{$shopName}/admin/api/{$this->shopifyApiVersion}/graphql.json";

        $client = new Client([
            'base_uri' => $baseUri,
            'headers' => [
                'Content-Type' => 'application/json',
                'X-Shopify-Access-Token' => $accessToken,
            ],
        ]);

        $requestData = [
            'query' => $query,
        ];

        if (!empty($variables)) {
            $requestData['variables'] = $variables;
        }

        $response = $client->post('', [
            'json' => $requestData,
        ]);

        return json_decode($response->getBody(), true);
    }

    public function updateCustomerDetails(Request $request)
    {
        $customerId = $request->input('customerId');
        $firstName = $request->input('firstName');
        $lastName = $request->input('lastName');
        $shopName = $request->input('shopName');
        $metafields = $request->input('metafields');
        $formName = $request->input('formName');

        $accessToken = DB::table('shops')->where('store', $shopName)->value('access_token');

        // Extract phone number
        $phoneNumber = '';
        foreach ($metafields as $metafield) {
            if ($metafield['key'] === 'telephone') {
                $phoneNumber = $metafield['value'];
                break;
            }
        }

        $customerMutation = <<<GRAPHQL
    mutation {
        customerUpdate(input: {
            id: "{$customerId}",
            firstName: "{$firstName}",
            lastName: "{$lastName}",
            phone : "{$phoneNumber}"
        }) {
            customer {
                id
                firstName
                lastName
                phone
            }
            userErrors {
                field
                message
            }
        }
    }
    GRAPHQL;

        $customerResponse = $this->shopifyRequest($shopName, $accessToken, $customerMutation);

        if (isset($customerResponse['data']['customerUpdate']['userErrors']) && !empty($customerResponse['data']['customerUpdate']['userErrors'])) {
            $errors = $customerResponse['data']['customerUpdate']['userErrors'];
            $errorMessages = array_map(function ($error) {
                return $error['message'];
            }, $errors);

            return response()->json(['errors' => $errorMessages], 422);
        }

        $metafieldsVariables = [
            'metafields' => array_map(function ($metafield) use ($customerId) {
                return [
                    'ownerId' => $customerId,
                    'namespace' => $metafield['namespace'],
                    'key' => $metafield['key'],
                    'value' => $metafield['value'],
                    'type' => $metafield['type'],
                ];
            }, $metafields),
        ];


        $metafieldsMutation = <<<GRAPHQL
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

        $metafieldsResponse = $this->shopifyRequest($shopName, $accessToken, $metafieldsMutation, $metafieldsVariables);

        if (isset($metafieldsResponse['data']['metafieldsSet']['userErrors']) && !empty($metafieldsResponse['data']['metafieldsSet']['userErrors'])) {
            $errors = $metafieldsResponse['data']['metafieldsSet']['userErrors'];
            $errorMessages = array_map(function ($error) {
                return $error['message'];
            }, $errors);

            return response()->json(['errors' => $errorMessages], 422);
        }

        return response()->json([
            'formName' => $formName,
            'shopName' => $shopName,
            'metafields' => $metafieldsResponse['data']['metafieldsSet']['metafields'],
        ]);
    }

}

