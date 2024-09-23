<?php namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class QnController extends Controller
{
    public function getDetails(Request $request)
{
    $customerId = $request['customer_id'];
    $storeData = DB::table('shops')->where('store', $request['shop_name'])->first();

    if (isset($storeData) && $storeData != "") {
        $storeUrl = $storeData->store;
        $accessToken = $storeData->access_token;
        $apiVersion = "2024-07";
        $url = "https://$storeUrl/admin/api/$apiVersion/graphql.json";
        $query = '{ customer(id: "gid://shopify/Customer/'. $customerId. '") { orders(first: 1, reverse: true) { edges { node { customAttributes { key value } } } } } }';
        $response = Http::withHeaders([
            'X-Shopify-Access-Token' => $accessToken,
            'Content-Type' => 'application/json',
        ])->post($url, ['query' => $query]);

        $result = $response->json();

        if (isset($result['data']['customer']['orders']['edges']) && $result['data']['customer']['orders']['edges'] != "") {
            $orderDetails = $result['data']['customer']['orders']['edges'];

            foreach ($orderDetails as $orderDetail) {
                if (isset($orderDetail['node']['customAttributes']) && $orderDetail['node']['customAttributes'] != "") {
                    $additionalDetails = $orderDetail['node']['customAttributes'];

                    foreach ($additionalDetails as $additionalDetail) {
                        if (isset($additionalDetail['key']) && $additionalDetail['key'] != "") {
                            $key = $additionalDetail['key'];

                            if ($key == "qn_id") {
                                $value = $additionalDetail['value'];
                                Log::info("value:: $value");	

                                $questionsUrl = "https://q-uk.cialistogether.com/api/questionnaire/$value";
                                $questionsResponse = Http::withHeaders([
                                    'x-api-key' => 'cda19d46-031b-4afb-9df8-d0909cb05670',
                                    'Content-Type' => 'application/json',
                                ])->get($questionsUrl);

                                $questionsResult = $questionsResponse->json();
                                if (isset($questionsResult) && $questionsResult != "" && $questionsResult != null) {
                                    $questionnaireUrl = "https://q-uk.cialistogether.com/api/questionnaire/questions";
                                    $questionnaireResponse = Http::withHeaders([
                                        'x-api-key' => 'cda19d46-031b-4afb-9df8-d0909cb05670',
                                        'Content-Type' => 'application/json',
                                    ])->get($questionnaireUrl);

                                    $questionnaireResult = $questionnaireResponse->json();
                                    if (isset($questionnaireResult) && $questionnaireResult != "" && $questionnaireResult != null) {
                                        $finalResult = [];

                                        foreach ($questionsResult as $key => $value) {
                                            foreach ($questionnaireResult['pages'] as $page) {
                                                foreach ($page['elements'] as $element) {
                                                    if ($element['name'] == $key) {
                                                        $hasCorrectAnswer = false;
                                                        $elementText = $element['title']['default'] ?? $element['title'];
                                                        $elementDesc = $element['description']['default'] ?? null;
                                                        $answers = [];
                                                        foreach ($element['choices'] as $choice) {
                                                            $valuesArray = explode(',', $value);
                                                            $isCorrect = in_array($choice['value'], $valuesArray);
                                                            $answers[] = [
                                                                'value' => $choice['value'],
                                                                'text' => $choice['text'],
                                                                'is_correct' => $isCorrect,
                                                            ];
                                                        
                                                            if ($isCorrect) {
                                                                $hasCorrectAnswer = true;
                                                            }
                                                        }
                                                        
                                                        if ($hasCorrectAnswer) {
                                                            $finalResult[$key] = [
                                                                'answers' => $answers,
                                                                'title' => $elementText,
                                                                'desc' => $elementDesc,
                                                            ];
                                                        }
                                                    }
                                                }
                                            }
                                        }

                                        $userName = isset($questionsResult['a_1_b_2_name']) ? $questionsResult['a_1_b_2_name'] : '';
                                        $userPhone = isset($questionsResult['a_1_b_2_phone']) ? $questionsResult['a_1_b_2_phone'] : '';
                                        $finalResult['a_1_b_2'] = [
                                            'name' => $userName,
                                            'phone' => $userPhone
                                        ];
                                        $otherMedicine = isset($questionsResult['a_10_other']) ? $questionsResult['a_10_other'] : '';
                                        $finalResult['a_10_other'] = [
                                            'otherMedicine' => $otherMedicine,
                                        ];
                                        return response()->json($finalResult);
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } else {
            return response()->json(['error' => 'No orders found'], 404);
        }
    } else {
        return response()->json(['error' => 'Store not found'], 404);
    }
}


    public function generateQnId(Request $request)
    {

        $requestData = json_decode($request['json'], true);
        $shopName = $requestData['shop_name'];
        $customerId = $requestData['customer_id'];
        $storeData = DB::table('shops')->where('store', $shopName)->first();

        if (isset($storeData) && $storeData != "") {

            $storeUrl = $storeData->store;
            $accessToken = $storeData->access_token;
            $apiVersion = "2024-07";
            $url = "https://$storeUrl/admin/api/$apiVersion/graphql.json";
            $query = '{ customer(id: "gid://shopify/Customer/'. $customerId. '") { orders(first: 1, reverse: true) { edges { node { customAttributes { key value } } } } } }';
            $response = Http::withHeaders([
                'X-Shopify-Access-Token' => $accessToken,
                'Content-Type' => 'application/json',
            ])->post($url, [
                'query' => $query,
            ]);

            $result = $response->json();

            if (isset($result['data']['customer']['orders']['edges']) && $result['data']['customer']['orders']['edges'] != "") {
                $orderDetails = $result['data']['customer']['orders']['edges'];

                foreach ($orderDetails as $orderDetail) {
                    if (isset($orderDetail['node']['customAttributes']) && $orderDetail['node']['customAttributes'] != "") {
                        $additionalDetails = $orderDetail['node']['customAttributes'];

                        foreach ($additionalDetails as $additionalDetail) {
                            if (isset($additionalDetail['key']) && $additionalDetail['key'] != "") {
                                $key = $additionalDetail['key'];
                                if ($key == "qn_id") {
                                    
                                    $value = $additionalDetail['value'];

                                    $questionsUrl = "https://q-uk.cialistogether.com/api/questionnaire/$value";
                                    $questionsResponse = Http::withHeaders([
                                        'x-api-key' => 'cda19d46-031b-4afb-9df8-d0909cb05670',
                                        'Content-Type' => 'application/json',
                                    ])->get($questionsUrl);

                                    $questionsResult = $questionsResponse->json();

                                    if (isset($questionsResult) && $questionsResult != "" && $questionsResult != null) {
                                        $uuid = Str::uuid()->toString();
                                        $ip = $questionsResult['ip'];
                                        $dataSender = [
                                            'a_1' => $questionsResult['a_1'] ?? '',
                                            'a_1_b' => $questionsResult['a_1_b'] ?? '',
                                            'a_1_b_2_name' => $questionsResult['a_1_b_2_name'] ?? '',
                                            'a_1_b_2_phone' => $questionsResult['a_1_b_2_phone'] ?? '',
                                            'a_1_b_3' => $questionsResult['a_1_b_3'] ?? '',
                                            'a_1_b_4' => $questionsResult['a_1_b_4'] ?? '',
                                            'a_2' => $questionsResult['a_2'] ?? '',
                                            'a_3' => $questionsResult['a_3'] ?? '',
                                            'a_4' => $questionsResult['a_4'] ?? '',
                                            'a_5' => $questionsResult['a_5'] ?? '',
                                            'a_6' => $questionsResult['a_6'] ?? '',
                                            'a_7' => $questionsResult['a_7'] ?? '',
                                            'a_8' => $questionsResult['a_8'] ?? '',
                                            'a_9' => $questionsResult['a_9'] ?? '',
                                            'a_10' => $questionsResult['a_10'] ?? '',
                                            'a_10_other' => $questionsResult['a_10_other'] ?? '',
                                            'a_11' => $questionsResult['a_11'] ?? '',
                                            'status' => $questionsResult['status'] ?? '',
                                        ];
                                        $postData = [
                                            'uuid' => $uuid,
                                            'ip' => $ip,
                                            'dataSender' => $dataSender,
                                        ];

                                        $response = Http::withHeaders([
                                            'x-api-key' => 'cda19d46-031b-4afb-9df8-d0909cb05670',
                                        ])->post('https://q-uk.cialistogether.com/api/questionnaire/', $postData);

                                        if ($response->successful()) {
                                            $responseBody = json_decode($response->body(), true);

                                            if (isset($responseBody['status']) && $responseBody['status'] === 'created') {
                                                return response()->json($uuid);
                                            } else {
                                                Log::warning('Data creation failed or returned a different status.');
                                            }
                                        } else {
                                            Log::info("Request failed");
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            } else {
                return response()->json(['error' => 'No orders found'], 404);
            }
        } else {
            return response()->json(['error' => 'Store not found'], 404);
        }
    }
}

