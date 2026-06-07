from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth import update_session_auth_hash
from django.contrib.auth.models import User
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework.authtoken.models import Token
from django.core.cache import cache

class CustomObtainAuthToken(ObtainAuthToken):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        if not username:
            return Response({'error': 'Login kiritilmadi'}, status=status.HTTP_400_BAD_REQUEST)
            
        lockout_key = f"lockout_{username}"
        failed_attempts_key = f"failed_attempts_{username}"
        
        # Check if currently locked out
        if cache.get(lockout_key):
            # Django's locmem cache might return None for ttl, so default to 300
            remaining = cache.ttl(lockout_key) if hasattr(cache, 'ttl') else 300
            if remaining is None or remaining <= 0:
                remaining = 300
            return Response({
                'error': f"Ko'p xato urinishlar tufayli login bloklangan. Iltimos, {remaining} soniyadan keyin qayta urining."
            }, status=status.HTTP_429_TOO_MANY_REQUESTS)
            
        serializer = self.serializer_class(data=request.data, context={'request': request})
        
        if not serializer.is_valid():
            attempts = cache.get(failed_attempts_key, 0) + 1
            cache.set(failed_attempts_key, attempts, timeout=300) # 5 minutes window
            
            if attempts >= 5:
                cache.set(lockout_key, True, timeout=300) # Lock for 5 minutes
                cache.delete(failed_attempts_key)
                return Response({
                    'error': "Ko'p noto'g'ri urinishlar tufayli login 5 daqiqaga bloklandi."
                }, status=status.HTTP_429_TOO_MANY_REQUESTS)
                
            remaining_attempts = 5 - attempts
            return Response({
                'error': f"Login yoki parol noto'g'ri. Yana {remaining_attempts} ta urinish qoldi."
            }, status=status.HTTP_400_BAD_REQUEST)
            
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        cache.delete(failed_attempts_key)
        
        return Response({
            'token': token.key,
            'user_id': user.pk,
            'username': user.username
        })

class ChangeCredentialsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user
        new_username = request.data.get('username')
        current_password = request.data.get('current_password')
        new_password = request.data.get('new_password')

        if not current_password:
            return Response({'error': "Joriy parol kiritilishi shart"}, status=status.HTTP_400_BAD_REQUEST)

        if not user.check_password(current_password):
            return Response({'error': "Joriy parol noto'g'ri"}, status=status.HTTP_400_BAD_REQUEST)

        if new_username:
            new_username = new_username.strip()
            if not new_username:
                return Response({'error': "Login bo'sh bo'lishi mumkin emas"}, status=status.HTTP_400_BAD_REQUEST)
            if User.objects.exclude(pk=user.pk).filter(username=new_username).exists():
                return Response({'error': "Ushbu login band"}, status=status.HTTP_400_BAD_REQUEST)
            user.username = new_username

        if new_password:
            if len(new_password) < 6:
                return Response({'error': "Yangi parol kamida 6 ta belgidan iborat bo'lishi kerak"}, status=status.HTTP_400_BAD_REQUEST)
            user.set_password(new_password)

        user.save()
        update_session_auth_hash(request, user)
        return Response({'message': "Xavfsizlik sozlamalari muvaffaqiyatli yangilandi", 'username': user.username})
