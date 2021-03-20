from django.shortcuts import render
from rest_framework.response import Response
from rest_framework import status, viewsets
from rest_framework.decorators import api_view
from rest_framework.status import (
    HTTP_400_BAD_REQUEST,
    HTTP_404_NOT_FOUND,
    HTTP_200_OK
)
from rest_framework.decorators import action
from django.views.decorators.csrf import csrf_exempt
import requests, json, os
from core.models import Session, Navigation
from core.serializers import SessionSerializer, NavigationSerializer
import numpy as np    
from collections import OrderedDict 
from django.contrib.staticfiles import finders

def index(request):
    return render(request, "build/index.html")



@csrf_exempt
@api_view(["POST"])
def find_sentence(request):
    found = False
    video_id=request.data['videoID']
    mixed = request.data['mixed']
    if(mixed):
        start_time = request.data['startTime']
        end_time = request.data['endTime']
    corpus = [transcript]
    corpus_time = []
    with open('../demo/public/'+video_id+'.json') as subtitle:
        sjson = subtitle.read()
        sjdata = json.loads(sjson)
        if(mixed):
            for line in sjdata:
                if(line['start'] > start_time and line['end'] < end_time):
                    corpus.append(line['content'])
                    corpus_time.append(line['start'])
        else:
            for line in sjdata:
                corpus.append(line['content'])
                corpus_time.append(line['start'])
    
    return Response({'time_options': result_times, 'content_options': result_content, 'keyword_indexes': keyword_indexes, 'found': found})



class SessionViewSet(viewsets.ModelViewSet):
    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update`, and `destroy` actions.
    """
    queryset = Session.objects.all()
    serializer_class = SessionSerializer

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        return Response(serializer.data, status=HTTP_200_OK)

    def perform_create(self, serializer):
        serializer.save()

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)      

    @action(detail=True, methods=['post'], name='add pause')
    def add_pause(self, request, pk=None):
        session = self.get_object()
        print('the request time data is ', request.data['time'], session)
        session.pauses.append(request.data['time'])
        session.save()
        return Response({'status': 'pause added'})

    @action(detail=True, methods=['post'], name='add bookmark')
    def add_bookmark(self, request, pk=None):
        session = self.get_object()
        print('the request time data is ', request.data['time'])
        session.bookmarks.append(request.data['time'])
        session.save()
        return Response({'status': 'bookmark added'})

    @action(detail=True, methods=['post'], name='add transcript')
    def add_transcript(self, request, pk=None):
        session = self.get_object()
        print('the request time data is ', request.data['time'])
        session.transcripts.append(request.data['transcript'])
        session.transcript_times.append(request.data['time'])
        session.save()
        return Response({'status': 'transcript added'})

    @action(detail=True, methods=['post'], name='add returnpoint')
    def add_returnpoint(self, request, pk=None):
        session = self.get_object()
        print('the request time data is ', request.data['time'])
        session.returnpoints.append(request.data['time'])
        session.save()
        return Response({'status': 'returnpoint added'})

class NavigationViewSet(viewsets.ModelViewSet):

    """
    This viewset automatically provides `list`, `create`, `retrieve`,
    `update`, and `destroy` actions.
    """
    queryset = Navigation.objects.all()
    serializer_class = NavigationSerializer

    def create(self, request, *args, **kwargs):
        print('here', request.data)
        session = request.data['sessionID']
        print('session is', session)
        session_instance = Session.objects.filter(id=session).first()
        print('session_instance is', session_instance)
        serializer = self.get_serializer(data=request.data)
        if not serializer.is_valid():
            print(serializer.errors)
        self.perform_create(serializer, session_instance)

        # serializer.save(Session = session_instance)
        # serializer.save()
        return Response(serializer.data, status=HTTP_200_OK)

    def perform_create(self, serializer, session_instance):
        serializer.save(session = session_instance)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)

        if getattr(instance, '_prefetched_objects_cache', None):
            # If 'prefetch_related' has been applied to a queryset, we need to
            # forcibly invalidate the prefetch cache on the instance.
            instance._prefetched_objects_cache = {}

        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)   
