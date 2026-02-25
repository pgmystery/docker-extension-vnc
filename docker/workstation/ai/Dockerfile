ARG BASE_IMAGE="pgmystery/workstation-python:latest"
FROM ${BASE_IMAGE}

USER root

# Install AI/ML libraries (CPU versions)
RUN pip install --no-cache-dir \
    torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cpu \
    transformers \
    scikit-learn \
    pandas \
    numpy \
    matplotlib \
    seaborn \
    scipy

USER vncuser
