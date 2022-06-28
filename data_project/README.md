# Using Tinybird with r/place

This repository contains the data project —[datasources](./datasources), and [endpoints](./endpoints)— and [data-generator](./rplace.py) scripts for an r/place example of using Tinybird.

You can find more informat about this project on [r/place](https://www.reddit.com/r/place/)

To clone the repository:

`git clone https://github.com/raqyuste/r-place.git`

`cd r-place`

## Working with the Tinybird CLI

To start working with data projects as if they were software projects, let's install the Tinybird CLI in a virtual environment.
Check the [CLI documentation](https://docs.tinybird.co/cli.html) for other installation options and troubleshooting.

```bash
virtualenv -p python3 .e
. .e/bin/activate
pip install tinybird-cli
tb auth --interactive
```

Choose your region: __1__ for _us-east_, __2__ for _eu_

Go to your workspace, copy a token with admin rights and paste it. A new `.tinyb` file will be created.  

## Project description

```bash
├── datasources
│   ├── pixels_table.datasource
├── endpoints
│   ├── get_snapshot.pipe
```

In the `/datasources` folder we have one Data Source:
- pixels_table: where we'll be sending every pixel change

Also we have one endpoint in the `/endpoints` folder:
- get_snapshot: This endpoints get the last snapshot all of pixels ([optional filter by timestamp]((https://guides.tinybird.co/guide/using-dynamic-parameters-for-changing-aggregation-types-on-the-fly)))

Note:
Typically, in big projects, we split the .pipe files across two folders: /pipes and /endpoints
- `/pipes` where we store the pipes ending in a datasource, that is, [materialized views](https://guides.tinybird.co/guide/materialized-views)
- `/endpoints` for the pipes that end in API endpoints. 

## Pushing the data project to your Tinybird workspace

Push the data project —datasources, pipes and fixtures— to your workspace.

```bash
tb push --fixtures
```
  
Your data project is ready for realtime analysis. You can check the UI's Data flow to see how it looks.

<img width="873" alt="image" src="https://user-images.githubusercontent.com/51535157/171652448-8ce46bbb-8194-4d6c-89e8-53f0c816a4df.png">


## Ingesting data using high-frequency ingestion (HFI)

Let's add some data through the [HFI endpoint](https://www.tinybird.co/guide/high-frequency-ingestion).

To do that we have created a python script to generate and send dummy events, using the file rplace.py

## Token security

You now have your Data Sources and pipes that end in API endpoints. 

The endpoints need a [token](https://www.tinybird.co/guide/serverless-analytics-api) to be consumed. You should not expose your admin token, so let's create one with more limited scope.

```bash
pip install jq

TOKEN=$(cat .tinyb | jq '.token'| tr -d '"')
HOST=$(cat .tinyb | jq '.host'| tr -d '"')

curl -H "Authorization: Bearer $TOKEN" \
-d "name=pixels_table_write" \
-d "scope=PIPES:READ:get_snapshot" \
-d "scope=DATASOURCE:READ:pixels_table" \
-d "scope=DATASOURCE:WRITE:pixels_table" \
$HOST/v0/tokens/
```

You will receive a response similar to this:

```json
{
    "token": "<the_newly_ceated_token>",
    "scopes": [
        {
            "type": "PIPES:READ",
            "resource": "get_snapshot",
            "filter": ""
        },
        {
            "type": "DATASOURCE:READ",
            "resource": "pixels_table",
            "filter": ""
        },
        {
            "type": "DATASOURCE:WRITE",
            "resource": "pixels_table",
            "filter": ""
        }
    ],
    "name": "pixels_table_write"
}
```

This project shows just some of the features of Tinybird. If you have any questions, come along and join our community [Slack](https://join.slack.com/t/tinybird-community/shared_invite/zt-yi4hb0ht-IXn9iVuewXIs3QXVqKS~NQ)!
