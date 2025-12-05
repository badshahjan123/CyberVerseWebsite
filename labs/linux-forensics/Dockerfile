# Assumes: Docker Desktop installed and running
# Base: Ubuntu 22.04 for stability
FROM ubuntu:22.04

# Prevent interactive prompts during build
ENV DEBIAN_FRONTEND=noninteractive

# Install required packages
RUN apt-get update && apt-get install -y \
    bash \
    sudo \
    curl \
    wget \
    vim \
    nano \
    grep \
    file \
    coreutils \
    ttyd \
    && rm -rf /var/lib/apt/lists/*

# Create lab user with passwordless sudo
RUN useradd -m -s /bin/bash labuser && \
    echo "labuser ALL=(ALL) NOPASSWD:ALL" >> /etc/sudoers

# Create investigation directory structure
RUN mkdir -p /home/labuser/investigation

# Copy lab files into container
COPY lab-files/ /home/labuser/investigation/
COPY welcome.sh /home/labuser/
COPY setup-lab.sh /tmp/

# Run setup script to create hidden files and flags
RUN chmod +x /tmp/setup-lab.sh && \
    /tmp/setup-lab.sh && \
    rm /tmp/setup-lab.sh

# Set proper ownership
RUN chown -R labuser:labuser /home/labuser

# Switch to lab user
USER labuser
WORKDIR /home/labuser

# Expose ttyd web terminal port
EXPOSE 7681

# Start ttyd web terminal
# -W: enable write access
# -p 7681: port binding
CMD ["ttyd", "-W", "-p", "7681", "/bin/bash"]
