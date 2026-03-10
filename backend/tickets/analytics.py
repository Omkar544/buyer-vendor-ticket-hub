import matplotlib
# CRITICAL: Force non-interactive backend to fix the 'tkinter' / GUI errors
matplotlib.use('Agg') 

import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from sqlalchemy import create_engine
import os

def generate_ticket_report():
    """
    Fetches real-time ticket data from PostgreSQL and generates 
    Seaborn visualizations for the Admin Dashboard.
    """
    try:
        # 1. Connect using SQLAlchemy (Preferred by Pandas for PostgreSQL)
        # Format: postgresql://username:password@host:port/database
        engine = create_engine('postgresql://postgres:your_password_here@127.0.0.1:5432/buyer_vendor_hub')
        
        # 2. Query data for the Vendor teams
        query = "SELECT category, status, priority FROM tickets_ticket"
        df = pd.read_sql_query(query, engine)

        if df.empty:
            print("No data found in PostgreSQL to analyze.")
            return

        # 3. Configure Seaborn theme for Professional Analytics
        sns.set_theme(style="whitegrid", palette="muted")
        plt.figure(figsize=(12, 7))

        # 4. Create Count Plot: Team Workload vs. Resolution Status
        # Shows OPEN vs. RESOLVED tickets for Tech, Billing, and Hardware
        ax = sns.countplot(
            data=df, 
            x='category', 
            hue='status', 
            order=['TECHNICAL', 'HARDWARE', 'BILLING']
        )
        
        plt.title('Vendor Performance & Resolution Distribution', fontsize=18, fontweight='bold', pad=25)
        plt.xlabel('Vendor Department', fontsize=13, fontweight='bold')
        plt.ylabel('Total Tickets', fontsize=13, fontweight='bold')
        plt.legend(title='Ticket Status', loc='upper right')

        # 5. Export Graph to React Public folder for instant UI update
        # Paths are calculated relative to this file's position
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        report_dir = os.path.join(base_dir, 'frontend', 'public', 'reports')
        
        if not os.path.exists(report_dir):
            os.makedirs(report_dir)

        report_path = os.path.join(report_dir, 'daily_analytics.png')
        
        # Save without triggering any GUI windows
        plt.savefig(report_path, bbox_inches='tight', dpi=300)
        plt.close() # Free up memory
        
        print(f"Success: PostgreSQL Analytics exported to {report_path}")

    except Exception as e:
        print(f"Analytics Engine Error: {str(e)}")

if __name__ == "__main__":
    generate_ticket_report()