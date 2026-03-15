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
    Fetches real-time ticket data from PostgreSQL and generates sanitized PNG reports.
    Matches the frontend logic to fix 404 and SuspiciousFileOperation errors.
    """
    try:
        # 1. Database Connection (Ensure password is correct)
        # Format: postgresql://username:password@host:port/database
        engine = create_engine('postgresql://postgres:your_password_here@127.0.0.1:5432/buyer_vendor_hub')
        
        # 2. Fetch Data with Category Join
        query = """
            SELECT t.priority, t.status, c.name as category_name 
            FROM tickets_ticket t
            JOIN tickets_ticketcategory c ON t.category_id = c.id
        """
        df = pd.read_sql_query(query, engine)

        if df.empty:
            print("⚠️ No data found in PostgreSQL to analyze.")
            return

        # 3. Setup Export Directory (D:\ticket-buyer-vendor-system\static\reports)
        # This relative pathing ensures it works regardless of where the script sits in the backend
        base_dir = os.path.dirname(os.path.dirname(os.path.dirname(__file__)))
        report_dir = os.path.join(base_dir, 'static', 'reports')
        
        if not os.path.exists(report_dir):
            os.makedirs(report_dir)
            print(f"📁 Created directory: {report_dir}")

        # Set professional styling
        sns.set_theme(style="whitegrid", palette="muted")

        # --- A. ADMIN: GLOBAL BAR CHART ---
        plt.figure(figsize=(12, 7))
        sns.countplot(data=df, x='category_name', hue='status', palette='viridis')
        plt.title('Global Ticket Status Distribution', fontsize=18, fontweight='bold', pad=25)
        plt.xlabel('Department / Agent', fontsize=12)
        plt.ylabel('Ticket Count', fontsize=12)
        plt.savefig(os.path.join(report_dir, 'global_analytics.png'), bbox_inches='tight', dpi=300)
        plt.close()
        print("✅ Generated: global_analytics.png")

        # --- B. ADMIN: GLOBAL WORKLOAD PIE CHART ---
        plt.figure(figsize=(8, 8))
        cat_counts = df['category_name'].value_counts()
        plt.pie(cat_counts, labels=cat_counts.index, autopct='%1.1f%%', 
                startangle=140, colors=sns.color_palette('pastel'),
                wedgeprops={'edgecolor': 'white', 'linewidth': 2})
        plt.title('Admin Overview: Total Workload Share', fontsize=16, fontweight='bold')
        plt.savefig(os.path.join(report_dir, 'admin_pie.png'), bbox_inches='tight', dpi=300)
        plt.close()
        print("✅ Generated: admin_pie.png")

        # --- C. DYNAMIC SANITIZED VENDOR CHARTS ---
        unique_teams = df['category_name'].unique()
        
        for team in unique_teams:
            dept_df = df[df['category_name'] == team]
            
            if not dept_df.empty:
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
                
                plt.title(f'{team} Priority Distribution', fontsize=16, fontweight='bold')
                
                # --- MATCHING FRONTEND SANITIZATION ---
                # Example: "Agent: Sanjay_k" -> "sanjay_k_priority.png"
                # Example: "Technical" -> "technical_priority.png"
                safe_name = team.lower().replace('agent:', '').strip().replace(' ', '_')
                file_name = f"{safe_name}_priority.png"
                
                plt.savefig(os.path.join(report_dir, file_name), bbox_inches='tight', dpi=300)
                plt.close()
                print(f"✅ Generated: {file_name}")

        print(f"\n🚀 Success: All analytics exported to {report_dir}")

    except Exception as e:
        print(f"❌ Analytics Engine Error: {str(e)}")

if __name__ == "__main__":
    generate_ticket_report()