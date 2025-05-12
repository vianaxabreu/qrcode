import qrcode
import random
import string
from datetime import datetime
import os
from google.auth import default
from googleapiclient.discovery import build
from google.oauth2 import service_account
# if usnig locally
# from dotenv import load_dotenv
import os


# if using locally:
# load_dotenv()

FORM_URL_BASE = os.getenv('FORM_URL_BASE')
OUTPUT_DIR = os.getenv('OUTPUT_DIR')
CODE_LENGTH = int(os.getenv('CODE_LENGTH'))
SPREADSHEET_ID = os.getenv('SPREADSHEET_ID')
RANGE_NAME = os.getenv('RANGE_NAME')
SA_PATH = os.getenv('SA_PATH')

def generate_random_code(length=6):
    return ''.join(random.choices(string.ascii_uppercase + string.digits, k=length))

def update_google_sheet(code):
    """Updates the Google Sheets with the generated code."""
    
    creds, _ = default(scopes=["https://www.googleapis.com/auth/spreadsheets"])

    # if using locally
    # creds = service_account.Credentials.from_service_account_file(SA_PATH)
    

    # Build the service for interacting with Google Sheets
    service = build('sheets', 'v4', credentials=creds)

    # Read the sheet to find today's date
    sheet = service.spreadsheets().values().get(spreadsheetId=SPREADSHEET_ID, range=RANGE_NAME).execute()
    values = sheet.get('values', [])
    #print(values)

    # Get today's date in the correct format
    today = str(datetime.now().strftime('%m/%d/%Y'))

    # Look for today's date in column A (Date)
    row_index = -1
    for i, row in enumerate(values):
        print(i,"...",row)
        if row and row[0] == today:
            row_index = i
            break

    # If today's date is found, update the corresponding row with the generated code
    if row_index >= 0:
        # Update column B with the generated code
        request = service.spreadsheets().values().update(
            spreadsheetId=SPREADSHEET_ID,
            range=f'Sheet1!B{row_index + 1}',  # Correct row index, column B
            valueInputOption='RAW',
            body={'values': [[code]]}
        )
        response = request.execute()
        print(f"Updated Google Sheet: Code '{code}' written to row {row_index + 1}.")
    else:
        print(f"Today's date ({today}) not found in the sheet.")

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)

    code = generate_random_code(CODE_LENGTH)
    # full_url = f"{FORM_URL_BASE}{code}"
    full_url = f"{FORM_URL_BASE}"
    # Generate QR code
    qr = qrcode.make(full_url)
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    #file_name = f"qr_{code}_{timestamp}.png"
    file_name = "qr.png"
    file_path = os.path.join(OUTPUT_DIR, file_name)
    qr.save(file_path)
    update_google_sheet(code)
    # Save the code for tracking
    with open(os.path.join(OUTPUT_DIR, "latest_code.txt"), "w") as f:
        f.write(code + "\n")
        f.write(full_url + "\n")
        f.write(timestamp)

    print(f"QR code for {code} saved to {file_path}")

if __name__ == "__main__":
    main()
