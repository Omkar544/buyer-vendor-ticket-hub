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
    1. Global Status Bar Chart (global_analytics.png)
    2. Admin Global Distribution Pie Chart (admin_pie.png)
    3. Dynamic Vendor-specific Priority Charts
    """
    try:
        # 1. Database Connection (Updated to match your project DB name)
        engine = create_engine('postgresql://postgres:your_password_here@127.0.0.1:5432/buyer_vendor_hub')
        
        # 2. Fetch Data (Updated to JOIN with the new Category table)
        query = """
            SELECT t.priority, t.status, c.name as category_name 
            FROM tickets_ticket t
            JOIN tickets_ticketcategory c ON t.category_id = c.id
        """
        df = pd.read_sql_query(query, engine)

        if df.empty:
            print("No data found in PostgreSQL to analyze.")
            return

        # 3. Setup Export Directory (Points to Django Static for Admin/Vendor access)
        # Using static folder ensures files are served correctly via the URL we added
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        report_dir = os.path.join(base_dir, 'static', 'reports')
        if not os.path.exists(report_dir):
            os.makedirs(report_dir)

        sns.set_theme(style="whitegrid", palette="muted")

        # --- A. ADMIN: GLOBAL BAR CHART (Status per Team) ---
        plt.figure(figsize=(12, 7))
        sns.countplot(data=df, x='category_name', hue='status', palette='viridis')
        plt.title('Global Ticket Status Distribution', fontsize=18, fontweight='bold', pad=25)
        plt.savefig(os.path.join(report_dir, 'global_analytics.png'), bbox_inches='tight', dpi=300)
        plt.close()

        # --- B. ADMIN: GLOBAL CATEGORY PIE CHART (Workload Share) ---
        plt.figure(figsize=(8, 8))
        cat_counts = df['category_name'].value_counts()
        plt.pie(cat_counts, labels=cat_counts.index, autopct='%1.1f%%', 
                startangle=140, colors=sns.color_palette('pastel'),
                wedgeprops={'edgecolor': 'white', 'linewidth': 2})
        plt.title('Admin Overview: Total Workload Share', fontsize=16, fontweight='bold')
        plt.savefig(os.path.join(report_dir, 'admin_pie.png'), bbox_inches='tight', dpi=300)
        plt.close()

        # --- C. DYNAMIC VENDOR CHARTS (Generates for every registered team) ---
        # No more hardcoded lists! It finds every team in your DB.
        unique_teams = df['category_name'].unique()
        
        for team in unique_teams:
            dept_df = df[df['category_name'] == team]
            
            if not dept_df.empty:
                # Priority Pie Chart for Vendor Dashboard
                plt.figure(figsize=(8, 8))
                priority_counts = dept_df['priority'].value_counts()
                
                plt.pie(
                    priority_counts, 
                    labels=priority_counts.index, 
                    autopct='%1.1f%%', 
                    startangle=140, 
                    colors=sns.color_palette('flare'),
                    wedgeprops={'edgecolor': 'white', 'linewidth': 2}
                )
                
                plt.title(f'{team} Team Priority Load', fontsize=16, fontweight='bold')
                
                # Save as 'technical_priority.png', 'billing_priority.png', etc.
                file_name = f"{team.lower()}_priority.png"
                plt.savefig(os.path.join(report_dir, file_name), bbox_inches='tight', dpi=300)
                plt.close()

        print(f"Success: Analytics exported to {report_dir}")

    except Exception as e:
        print(f"Analytics Engine Error: {str(e)}")

if __name__ == "__main__":
    generate_ticket_report()