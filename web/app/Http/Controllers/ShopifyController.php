<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class ShopifyController extends Controller
{
    private $customerId;

    public function updateOrCreateMetafields(Request $request)
    {
        $this->customerId = $request->input('customerId');
        $metafields[] = $request->input('metafield');
        $shopName = $request->input('shopName');

        if (!is_array($metafields)) {
            Log::error('Invalid metafields format', ['metafields' => $metafields]);
            return response()->json(['message' => 'Invalid metafields format'], 400);
        }

        $tags = $this->getCustomerTags($this->customerId, $shopName);
        $defaultEmailPreference = in_array('newsletter', $tags) && in_array('Subscriber', $tags);

        foreach ($metafields as &$metafield) {
            if (is_array($metafield) && isset($metafield['key']) && $metafield['key'] == 'email_preference') {
                if ($metafield['value'] === null) {
                    $metafield['value'] = $defaultEmailPreference ? 'true' : 'false';
                }
            }
        }

        if (isset($metafield['key']) && $metafield['key'] == 'email_preference') {
            if ($defaultEmailPreference && isset($metafields[0]['value']) && $metafields[0]['value'] == 'false') {
                $this->removeTags($this->customerId, ['newsletter', 'Subscriber'], $shopName);
                $this->updateEmailMarketingConsent($this->customerId, 'UNSUBSCRIBED', $shopName);
            } elseif (!$defaultEmailPreference && isset($metafields[0]['value']) && $metafields[0]['value'] == 'true') {
                $this->addTags($this->customerId, ['newsletter', 'Subscriber'], $shopName);
                $this->updateEmailMarketingConsent($this->customerId, 'SUBSCRIBED', $shopName);
            }
        }

        foreach ($metafields as $metafield) {
            if (isset($metafield['key']) && $metafield['key'] == 'sms_preferences') {
                $marketingState = $metafield['value'] == 'true' ? 'SUBSCRIBED' : 'UNSUBSCRIBED';
                $smsResponse = $this->updateSmsMarketingConsent($this->customerId, $marketingState, $shopName);

                if (!$smsResponse['success']) {
                    return response()->json(['message' => $smsResponse['message']], 400);
                }
            }
        }

        $formattedMetafields = array_map(function ($metafield) {
            if (is_array($metafield) && isset($metafield['namespace'], $metafield['key'], $metafield['value'], $metafield['type'])) {
                return [
                    'ownerId' => $this->customerId,
                    'namespace' => $metafield['namespace'],
                    'key' => $metafield['key'],
                    'value' => $metafield['value'],
                    'type' => $metafield['type'],
                ];
            } else {
                Log::error('Invalid metafield format', ['metafield' => $metafield]);
                return null; 
            }
        }, $metafields);

        $formattedMetafields = array_filter($formattedMetafields);

        $updateResponse = $this->updateCustomerMetafields($formattedMetafields, $shopName);
        if (isset($updateResponse['userErrors']) && !empty($updateResponse['userErrors'])) {
            return response()->json(['message' => 'Failed to update metafields', 'errors' => $updateResponse['userErrors']], 400);
        }

        return response()->json(['message' => 'Metafields processed successfully']);
    }

    private function getCustomerTags($customerId, $shopName)
    {
        $query = <<<'GRAPHQL'
            query GetCustomerTags($id: ID!) {
                customer(id: $id) {
                    id
                    tags
                }
            }
        GRAPHQL;

        $variables = [
            'id' => $customerId,
        ];

        $response = $this->makeGraphQLRequest($query, $variables, $shopName);

        return $response['data']['customer']['tags'] ?? [];
    }

    private function addTags($customerId, $tagsToAdd, $shopName)
    {
        $mutation = <<<'GRAPHQL'
            mutation AddTags($id: ID!, $tags: [String!]!) {
                tagsAdd(id: $id, tags: $tags) {
                    userErrors {
                        field
                        message
                    }
                }
            }
        GRAPHQL;

        $variables = [
            'id' => $customerId,
            'tags' => $tagsToAdd,
        ];

        $response = $this->makeGraphQLRequest($mutation, $variables, $shopName);
        if (isset($response['data']['tagsAdd']['userErrors']) && !empty($response['data']['tagsAdd']['userErrors'])) {
            Log::error('Failed to add tags', ['errors' => $response['data']['tagsAdd']['userErrors']]);
        }
    }

    private function removeTags($customerId, $tagsToRemove, $shopName)
    {
        $mutation = <<<'GRAPHQL'
            mutation RemoveTags($id: ID!, $tags: [String!]!) {
                tagsRemove(id: $id, tags: $tags) {
                    userErrors {
                        field
                        message
                    }
                }
            }
        GRAPHQL;

        $variables = [
            'id' => $customerId,
            'tags' => $tagsToRemove,
        ];

        $response = $this->makeGraphQLRequest($mutation, $variables, $shopName);
        if (isset($response['data']['tagsRemove']['userErrors']) && !empty($response['data']['tagsRemove']['userErrors'])) {
            Log::error('Failed to remove tags', ['errors' => $response['data']['tagsRemove']['userErrors']]);
        }
    }

    private function updateCustomerMetafields($metafields, $shopName)
    {
        $mutation = <<<'GRAPHQL'
            mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
                metafieldsSet(metafields: $metafields) {
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

        $variables = [
            'metafields' => $metafields,
        ];

        return $this->makeGraphQLRequest($mutation, $variables, $shopName);
    }

    private function updateEmailMarketingConsent($customerId, $marketingState, $shopName)
    {
        $mutation = <<<'GRAPHQL'
            mutation EmailMarketing($input: CustomerEmailMarketingConsentUpdateInput!) {
                customerEmailMarketingConsentUpdate(input: $input) {
                    customer {
                        emailMarketingConsent {
                            marketingState
                            marketingOptInLevel
                        }
                    }
                    userErrors {
                        field
                        message
                    }
                }
            }
        GRAPHQL;

        $variables = [
            'input' => [
                'customerId' => $customerId,
                'emailMarketingConsent' => [
                    'marketingState' => $marketingState,
                    'marketingOptInLevel' => 'SINGLE_OPT_IN',
                ],
            ],
        ];

        $response = $this->makeGraphQLRequest($mutation, $variables, $shopName);
        if (isset($response['data']['customerEmailMarketingConsentUpdate']['userErrors']) && !empty($response['data']['customerEmailMarketingConsentUpdate']['userErrors'])) {
            Log::error('Failed to update email marketing consent', ['errors' => $response['data']['customerEmailMarketingConsentUpdate']['userErrors']]);
        }
    }

    private function getCustomerPhoneNumber($customerId, $shopName)
    {
        $query = <<<'GRAPHQL'
            query GetCustomerMetafield($customerId: ID!) {
                customer(id: $customerId) {
                    id
                    metafield(key: "telephone", namespace: "details") {
                        value
                    }
                }
            }
        GRAPHQL;

        $variables = [
            'customerId' => $customerId,
        ];

        $response = $this->makeGraphQLRequest($query, $variables, $shopName);

        if (isset($response['data']['customer']['metafield']['value'])) {
            return $response['data']['customer']['metafield']['value'];
        } else {
            Log::error('Failed to fetch customer phone number', ['response' => $response]);
            return null;
        }
    }

    private function updateSmsMarketingConsent($customerId, $marketingState, $shopName)
    {
        $phoneNumber = $this->getCustomerPhoneNumber($customerId, $shopName);
        if ($phoneNumber === null) {
            Log::error('Phone number is required to update SMS marketing consent but was not found.');
            return [
                'success' => false,
                'message' => 'To activate the SMS preference, you need to add a phone number from the My Details form.',
            ];
        }

        $mutation = <<<'GRAPHQL'
            mutation SmsMarketing($input: CustomerSmsMarketingConsentUpdateInput!) {
                customerSmsMarketingConsentUpdate(input: $input) {
                    customer {
                        id
                        phone
                        smsMarketingConsent {
                            marketingState
                            marketingOptInLevel
                            consentUpdatedAt
                            consentCollectedFrom
                        }
                    }
                    userErrors {
                        field
                        message
                        code
                    }
                }
            }
        GRAPHQL;

        $variables = [
            'input' => [
                'customerId' => $customerId,
                'smsMarketingConsent' => [
                    'marketingState' => $marketingState,
                    'marketingOptInLevel' => 'SINGLE_OPT_IN',
                ],
            ],
        ];

        $response = $this->makeGraphQLRequest($mutation, $variables, $shopName);
        if (isset($response['data']['customerSmsMarketingConsentUpdate']['userErrors']) && !empty($response['data']['customerSmsMarketingConsentUpdate']['userErrors'])) {
            Log::error('Failed to update SMS marketing consent', ['errors' => $response['data']['customerSmsMarketingConsentUpdate']['userErrors']]);
            return [
                'success' => false,
                'message' => 'Failed to update SMS marketing consent.',
            ];
        }

        return [
            'success' => true,
            'message' => 'SMS marketing consent updated successfully.',
        ];
    }

    private function makeGraphQLRequest($query, $variables, $storeName)
    {
        $accessToken = $this->getAccessToken($storeName);

        if ($accessToken) {
            $response = Http::withHeaders([
                'X-Shopify-Access-Token' => $accessToken,
                'Content-Type' => 'application/json',
            ])->post("https://{$storeName}/admin/api/2024-07/graphql.json", [
                'query' => $query,
                'variables' => $variables,
            ]);

            return $response->json();
        } else {
            Log::error("Access token not found for shop: {$storeName}");
            return [];
        }
    }

    private function getAccessToken($shopName)
    {
        return DB::table('shops')->where('store', $shopName)->value('access_token');
    }
}

