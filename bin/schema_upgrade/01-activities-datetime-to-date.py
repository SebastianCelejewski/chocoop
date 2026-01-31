import argparse
import boto3
from boto3.dynamodb.conditions import Attr
from datetime import datetime


def parse_args():
    parser = argparse.ArgumentParser(description="Migrate dateTime -> date in DynamoDB")
    parser.add_argument("--table", required=True, help="DynamoDB table name")
    parser.add_argument("--region", required=True, help="AWS region")
    parser.add_argument("--profile", required=True, help="AWS profile")
    return parser.parse_args()


def extract_date(date_time_str: str) -> str:
    """
    Extract YYYY-MM-DD from ISO datetime string.
    Works for:
      - 2025-01-29T14:23:45Z
      - 2025-01-29T14:23:45+01:00
    """
    return date_time_str[:10]


def main():
    args = parse_args()

    session = boto3.Session(
        profile_name=args.profile,
        region_name=args.region,
    )

    dynamodb = session.resource("dynamodb")
    table = dynamodb.Table(args.table)

    scan_kwargs = {
        "FilterExpression": Attr("dateTime").exists()
    }

    scanned = 0
    updated = 0

    while True:
        response = table.scan(**scan_kwargs)
        items = response.get("Items", [])

        for item in items:
            scanned += 1

            item_id = item["id"]
            date_time_value = item.get("dateTime")

            if not date_time_value:
                continue

            try:
                date_only = extract_date(date_time_value)
            except Exception as e:
                print(f"[SKIP] id={item_id} invalid dateTime={date_time_value}: {e}")
                continue

            table.update_item(
                Key={"id": item_id},
                UpdateExpression="""
                    SET #d = :date
                    REMOVE #dt
                """,
                ExpressionAttributeNames={
                    "#d": "date",
                    "#dt": "dateTime",
                },
                ExpressionAttributeValues={
                    ":date": date_only,
                },
            )

            updated += 1

        if "LastEvaluatedKey" not in response:
            break

        scan_kwargs["ExclusiveStartKey"] = response["LastEvaluatedKey"]

    print("Migration finished")
    print(f"Scanned items : {scanned}")
    print(f"Updated items : {updated}")


if __name__ == "__main__":
    main()
