======================================
Generate a Heat Orchestration Template
======================================

Heat Dashboard provides a user-friendly interface to generate
Heat Orchestration templates in a Drag and Drop way.


Generate a template
~~~~~~~~~~~~~~~~~~~

#. Log in to the dashboard.
#. On the :guilabel:`Project` tab, open the :guilabel:`Orchestration`
   tab and click :guilabel:`Template Generator` category.
#. Wait until the page is completely loaded. It may take several seconds.
#. Click the dropdown menu of Template Version, and choose an
   appropriate version.
#. Drag icons of resource types at the top of the page to the central
   canvas.
#. Click icons on the canvas to specify properties of resources.
#. Click EDIT button at the top of the canvas, to enable manipulate mode.
#. When in manipulate mode, click on CONNECT button to add an edge between
   icons.
#. Click edges to show details of connections.
#. Click the Generate Template button at the top-right of the page and 
   generated template will be shown in a text box. You can also add 
   modification to the template here.
#. Click CREATE STACK to jump to continue to :guilabel:`Launch Stack`.
#. Click DOWNLOAD STACK to download the generated template.
#. You can also click the Manage Drafts button at the top-right of the
   page, to temporarily save the editing canvas or to load a saved one.


Currently Supported resource types
~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~

13 types of resources are supported in the first release of Heat Dashboard.

#. OS::Cinder::Volume
#. OS::Cinder::VolumeAttachment
#. OS::Heat::ResourceGroup
#. OS::Neutron::FloatingIP
#. OS::Neutron::FloatingIPAssociation
#. OS::Neutron::Net
#. OS::Neutron::Port
#. OS::Neutron::Router
#. OS::Neutron::RouterInterface
#. OS::Neutron::SecurityGroup
#. OS::Neutron::Subnet
#. OS::Nova::KeyPair
#. OS::Nova::Server
