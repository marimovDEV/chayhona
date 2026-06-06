import os
import subprocess

def main():
    print("Collecting static files...")
    subprocess.run(["python", "manage.py", "collectstatic", "--noinput"], check=True)

    print("Building BentoTizim executable...")
    # Add data files to pyinstaller
    # We include frontend_dist and staticfiles
    
    separator = ';' if os.name == 'nt' else ':'
    
    cmd = [
        "pyinstaller",
        "--name", "BentoTizim",
        "--onefile",
        "--noconsole",
        f"--add-data=frontend_dist{separator}frontend_dist",
        f"--add-data=staticfiles{separator}staticfiles",
        "start.py"
    ]
    
    subprocess.run(cmd, check=True)
    print("Build completed! Check the 'dist' folder.")

if __name__ == "__main__":
    main()
