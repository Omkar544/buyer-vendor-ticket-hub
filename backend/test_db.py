import psycopg2

def check_connection():
    try:
        # Replace 'omkar544' with what you think your password is
        connection = psycopg2.connect(
            user="postgres",
            password="your_password_here", 
            host="127.0.0.1",
            port="5432",
            database="buyer_vendor_hub"
        )
        print("✅ Success: PostgreSQL connection established!")
        connection.close()
    except Exception as error:
        print(f"❌ Error: {error}")
        print("\nCommon Fixes:")
        print("1. Check if PostgreSQL Service is running in Windows Services.")
        print("2. Ensure the database 'buyer_vendor_hub' exists in pgAdmin.")
        print("3. Verify the password (try 'postgres', 'admin', or 'omkar544').")

if __name__ == "__main__":
    check_connection()