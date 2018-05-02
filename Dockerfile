FROM centos:6.9
RUN yum groupinstall -y 'Development Tools'
RUN curl --silent --location https://rpm.nodesource.com/setup_8.x | bash -
RUN yum install -y nodejs
RUN yum install -y wget
RUN yum install -y centos-release-scl-rh
RUN yum install -y devtoolset-3-gcc devtoolset-3-gcc-c++

ENV MANPATH=/opt/rh/devtoolset-3/root/usr/share/man:
ENV PERL5LIB=/opt/rh/devtoolset-3/root//usr/lib64/perl5/vendor_perl:/opt/rh/devtoolset-3/root/usr/lib/perl5:/opt/rh/devtoolset-3/root//usr/share/perl5/vendor_perl
ENV X_SCLS=devtoolset-3
ENV JAVACONFDIRS=/opt/rh/devtoolset-3/root/etc/java:/etc/java
ENV PCP_DIR=/opt/rh/devtoolset-3/root
ENV LD_LIBRARY_PATH=/opt/rh/devtoolset-3/root/usr/lib64:/opt/rh/devtoolset-3/root/usr/lib
ENV XDG_CONFIG_DIRS=/opt/rh/devtoolset-3/root/etc/xdg:/etc/xdg
ENV PATH=/opt/rh/devtoolset-3/root/usr/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ENV PYTHONPATH=/opt/rh/devtoolset-3/root/usr/lib64/python2.6/site-packages:/opt/rh/devtoolset-3/root/usr/lib/python2.6/site-packages
ENV XDG_DATA_DIRS=/opt/rh/devtoolset-3/root/usr/share:/usr/local/share:/usr/share
ENV INFOPATH=/opt/rh/devtoolset-3/root/usr/share/info

COPY . /build
WORKDIR /build
RUN npm install
RUN npm run buildexe
ENTRYPOINT [ "/bin/bash", "-l" ]
