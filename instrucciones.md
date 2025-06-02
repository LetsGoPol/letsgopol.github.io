https://dev.twitch.tv/console

ID Cliente: vqalkc5jdmzoh8kv3b2l3ezhh8wrl0
Secret Key: 8gm62lm06j1w4bv0vcg6gi74zwonew

https://id.twitch.tv/oauth2/authorize?response_type=code&client_id=vqalkc5jdmzoh8kv3b2l3ezhh8wrl0&redirect_uri=http://localhost:3000&scope=chat:read+chat:edit&state=c3ab8aa609ea11e793ae92361f002671

code: n03vjnuob299dvy1pepax6gtsxntda

curl -X POST 'https://id.twitch.tv/oauth2/token' \
-H 'Content-Type: application/x-www-form-urlencoded' \
-d 'client_id=vqalkc5jdmzoh8kv3b2l3ezhh8wrl0&client_secret=8gm62lm06j1w4bv0vcg6gi74zwonew&code=n03vjnuob299dvy1pepax6gtsxntda&grant_type=authorization_code&redirect_uri=http://localhost:3000'

RESPUESTA
{"access_token":"cafqqv5hcrk1qhrwtpe2m0aasyrguf","expires_in":14706,"refresh_token":"rpytbfhso2dbspu0c2x9772xikq8lhdqufifglikg6wrdd1dlf","scope":["chat:edit","chat:read"],"token_type":"bearer"}