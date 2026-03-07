import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
import sqlite3
import os

def generate_ticket_report():
    """
    Fetches ticket data from the Data Tier and generates 
    visual analytics for Vendor performance tracking.
    """
    try:
        # 1. Establish connection to the Data Tier
        # Note: If using PostgreSQL, swap this with your psycopg2 connection string
        db_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'db.sqlite3')
        conn = sqlite3.connect(db_path)
        
        # 2. Load data into a DataFrame for historical analysis
        query = "SELECT category, status, priority FROM tickets_ticket"
        df = pd.read_sql_query(query, conn)
        conn.close()

        if df.empty:
            print("No data found in PostgreSQL to analyze.")
            return

        # 3. Set visual theme for the Admin Dashboard
        sns.set_theme(style="whitegrid", palette="muted")
        plt.figure(figsize=(10, 6))

        # 4. Create Count Plot: Status Distribution by Team Category
        # This fulfills the 'Monitor Vendor Performance' objective
        ax = sns.countplot(data=df, x='category', hue='status')
        
        plt.title('Vendor Workload & Resolution Status', fontsize=16, fontweight='bold', pad=20)
        plt.xlabel('Department / Team', fontsize=12, fontweight='bold')
        plt.ylabel('Ticket Count', fontsize=12, fontweight='bold')
        plt.legend(title='Current Status', loc='upper right')

        # 5. Save the report to the React Public folder for instant display
        report_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(__file__))), 
                                 'frontend', 'public', 'reports')
        
        if not os.path.exists(report_dir):
            os.makedirs(report_dir)

        report_path = os.path.join(report_dir, 'daily_analytics.png')
        plt.savefig(report_path, bbox_inches='tight', dpi=300)
        plt.close()
        
        print(f"Success: Admin Analytics generated at {report_path}")

    except Exception as e:
        print(f"Analytics Error: {str(e)}")

if __name__ == "__main__":
    generate_ticket_report()