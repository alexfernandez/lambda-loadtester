# Lambda Loadtester

This package runs load tests against Lambda functions.

## Installation

Install using `npm`:

``` bash
npm install lambda-loadtester
```

Create a file `aws-config.json` in the project root directory,
which should contain your AWS credentials and target region:

``` json
{
    "accessKeyId": "AKIA...",
    "secretAccessKey": "...",
    "region": "eu-west-3"
}
```

## Run Test

To run your first test:

``` bash
node bin/run.js --endpoint [name] --body "{}"
```

The following options are available:

### `--endpoint [name]`

The function to invoke, mandatory.

### `--number [n]`

Number of total invocations to run, default 1.

### `--concurrency [c]`

Number of parallel invocations on the fly, default 1.

### `--body [body]`

The payload to send to the lambda function.
No default.

### `--file [path]`

Path to a file that contains a JSON document to send as the body.

## Invocation

The Lambda function is invoked as many times as the parameter `--number [n]`.

When `--concurrency c` is specified,
there will be at most `c` invocations in flight at the same time.

## Results

For every variable in the result it is shown:
total number of values, average and standard deviation.

## Acnowledgements

(C) 2020 Alex Fernández.

Licensed under the [MIT license](./LICENSE).

