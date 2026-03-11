import matplotlib
# CRITICAL: Force non-interactive backend for server-side generation
matplotlib.use('Agg') 

import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd
from sqlalchemy import create_engine
import os

def generate_ticket_report():
    """
    Fetches real-time ticket data from PostgreSQL and generates:
    1. Global Count Plot (daily_analytics.png)
    2. Department-specific Pie Charts (technical_priority.png, etc.)
    """
    try:
        # 1. Database Connection
        engine = create_engine('postgresql://postgres:your_password_here@127.0.0.1:5432/buyer_vendor_hub')
        
        # 2. Fetch Data
        query = "SELECT category, status, priority FROM tickets_ticket"
        df = pd.read_sql_query(query, engine)

        if df.empty:
            print("No data found in PostgreSQL to analyze.")
            return

        # 3. Setup Export Directory
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        report_dir = os.path.join(base_dir, 'frontend', 'public', 'reports')
        if not os.path.exists(report_dir):
            os.makedirs(report_dir)

        # --- GENERATE GLOBAL BAR CHART ---
        sns.set_theme(style="whitegrid", palette="muted")
        plt.figure(figsize=(12, 7))
        sns.countplot(
            data=df, 
            x='category', 
            hue='status', 
            order=['TECHNICAL', 'HARDWARE', 'BILLING']
        )
        plt.title('Vendor Performance & Resolution Distribution', fontsize=18, fontweight='bold', pad=25)
        plt.savefig(os.path.join(report_dir, 'daily_analytics.png'), bbox_inches='tight', dpi=300)
        plt.close()

        # --- GENERATE DEPARTMENT PIE CHARTS ---
        departments = ['TECHNICAL', 'BILLING', 'HARDWARE']
        
        for dept in departments:
            dept_df = df[df['category'] == dept]
            
            if not dept_df.empty:
                plt.figure(figsize=(8, 8))
                
                # Count priorities and plot
                priority_counts = dept_df['priority'].value_counts()
                
                # Professional color palette for High, Medium, Low
                colors = sns.color_palette('pastel')[0:len(priority_counts)]
                
                plt.pie(
                    priority_counts, 
                    labels=priority_counts.index, 
                    autopct='%1.1f%%', 
                    startangle=140, 
                    colors=colors,
                    wedgeprops={'edgecolor': 'white', 'linewidth': 2}
                )
                
                plt.title(f'{dept} Priority Distribution', fontsize=16, fontweight='bold')
                
                # Save specifically for the department frontend view
                pie_path = os.path.join(report_dir, f'{dept.lower()}_priority.png')
                plt.savefig(pie_path, bbox_inches='tight', dpi=300)
                plt.close()
                print(f"Generated: {pie_path}")

        print(f"Success: All PostgreSQL Analytics exported to {report_dir}")

    except Exception as e:
        print(f"Analytics Engine Error: {str(e)}")

if __name__ == "__main__":
    generate_ticket_report()