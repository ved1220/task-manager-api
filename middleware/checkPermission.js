function checkPermission ( role_name) {
    return (req, res, next) => {
      try {
        
        const userRole = req.user.role
        if ((userRole == role_name)) {
         next();
        }else{
            res.status(500).json({ message: 'Access denied' });
        }
  
       
      } catch (error) {
        console.log(error);
        
        res.status(500).json({ message: 'Error checking permissions' });
      }
    };
  }

  module.exports = { checkPermission };